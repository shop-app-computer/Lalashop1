import { Request, Response } from "express";
import User from "../models/userModel";
import { IAuthRequest } from "../middlewares/authMiddleware";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

export const getProfile = async (req: IAuthRequest, res: Response) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        if (user) {
            res.status(200).json({ success: true, data: user });
        } else {
            res.status(404).json({ success: false, message: "User not found" });
        }
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get public profile by username/id
export const getUserProfile = async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.params.id)
            .select("-password")
            .populate("followers", "name profileImage")
            .populate("following", "name profileImage");
        if (user) {
            res.status(200).json({ success: true, data: user });
        } else {
            res.status(404).json({ success: false, message: "User not found" });
        }
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateProfile = async (req: IAuthRequest, res: Response) => {
    try {
        // +password — needed below for the currentPassword bcrypt.compare when
        // the user wants to change their password. Other fields don't need
        // explicit opt-in because we only assign to them.
        const user = await User.findById(req.user._id).select("+password");

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
            user.profileImage = req.body.profileImage || user.profileImage;

            // Phone: can only be set once (for social login users who didn't provide phone at signup)
            if (req.body.phone) {
                if (user.phone) {
                    // Already has phone — reject change
                    return res.status(400).json({ 
                        success: false, 
                        message: "Phone number cannot be changed once set." 
                    });
                }
                user.phone = req.body.phone;
            }

            // Update username (handle)
            if (req.body.username && req.body.username !== user.username) {
                // Check 7-day restriction
                const now = new Date();
                if (user.lastUsernameChange) {
                    const diffTime = Math.abs(now.getTime() - new Date(user.lastUsernameChange).getTime());
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    if (diffDays < 0) {
                        return res.status(400).json({ 
                            success: false, 
                            message: `Username can only be changed once every 7 days. Please wait ${7 - diffDays} more days.` 
                        });
                    }
                }

                const existingUser = await User.findOne({ username: req.body.username });
                if (existingUser) {
                    return res.status(400).json({ success: false, message: "Username already taken" });
                }
                user.username = req.body.username;
                user.lastUsernameChange = now;
            } else if (!user.username && !req.body.username) {
              const baseUsername = user.name.toLowerCase().replace(/\s+/g, "_") + "_" + Math.floor(1000 + Math.random() * 9000);
              const existingUser = await User.findOne({ username: baseUsername });
              if (!existingUser) user.username = baseUsername;
            }
            
            if (req.body.password) {
                if (!req.body.currentPassword) {
                    return res.status(400).json({ success: false, message: "Current password is required to set a new password" });
                }
                const isMatch = await bcrypt.compare(req.body.currentPassword, user.password as string);
                if (!isMatch) {
                    return res.status(400).json({ success: false, message: "Incorrect current password" });
                }
                user.password = req.body.password;
            }

            if (req.body.twoFactorEnabled !== undefined) {
                user.twoFactorEnabled = req.body.twoFactorEnabled;
            }
            if (req.body.twoFactorType) {
                user.twoFactorType = req.body.twoFactorType;
            }

            const updatedUser = await user.save();

            res.status(200).json({
                success: true,
                _id: updatedUser._id,
                name: updatedUser.name,
                username: updatedUser.username,
                email: updatedUser.email,
                phone: updatedUser.phone,
                isAdmin: updatedUser.isAdmin,
                profileImage: updatedUser.profileImage,
                bio: updatedUser.bio,
                twoFactorEnabled: updatedUser.twoFactorEnabled,
                twoFactorType: updatedUser.twoFactorType,
                message: "Profile updated successfully"
            });
        } else {
            res.status(404).json({ success: false, message: "User not found" });
        }
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Toggle Follow/Unfollow
export const followUser = async (req: IAuthRequest, res: Response) => {
    try {
        const targetUserId = req.params.id;
        const myId = req.user._id;

        if (targetUserId === myId.toString()) {
            return res.status(400).json({ success: false, message: "You cannot follow yourself" });
        }

        const targetUser = await User.findById(targetUserId);
        const me = await User.findById(myId);

        if (!targetUser || !me) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const isFollowing = me.following.includes(new mongoose.Types.ObjectId(targetUserId));

        if (isFollowing) {
            // Unfollow
            me.following = me.following.filter(id => id.toString() !== targetUserId);
            targetUser.followers = targetUser.followers.filter(id => id.toString() !== myId.toString());
            await me.save();
            await targetUser.save();
            res.status(200).json({ success: true, message: "Unfollowed successfully", isFollowing: false });
        } else {
            // Follow
            me.following.push(new mongoose.Types.ObjectId(targetUserId));
            targetUser.followers.push(new mongoose.Types.ObjectId(myId));
            await me.save();
            await targetUser.save();
            res.status(200).json({ success: true, message: "Followed successfully", isFollowing: true });
        }
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get followers list
export const getFollowers = async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.params.id).populate("followers", "name profileImage bio");
        if (!user) return res.status(404).json({ success: false, message: "User not found" });
        res.status(200).json({ success: true, data: user.followers });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get following list
export const getFollowing = async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.params.id).populate("following", "name profileImage bio");
        if (!user) return res.status(404).json({ success: false, message: "User not found" });
        res.status(200).json({ success: true, data: user.following });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Public user search — used by Social search bar
export const searchUsers = async (req: Request, res: Response) => {
    try {
        const q = String(req.query.q || "").trim();
        const limit = Math.min(Math.max(parseInt(String(req.query.limit ?? "20"), 10) || 20, 1), 50);

        if (!q) {
            return res.status(200).json({ success: true, data: [] });
        }

        const safe = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const re = new RegExp(safe, "i");

        const users = await User.find({
            $or: [
                { name: re },
                { username: re },
                { customId: re },
            ],
        })
            .select("name username profileImage bio customId isSeller")
            .limit(limit);

        res.status(200).json({ success: true, data: users });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};