import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/userModel";
import Order from "../models/orderModel";

const extractIp = (req: Request): string => {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }
  if (Array.isArray(forwarded) && forwarded.length > 0) {
    return forwarded[0];
  }
  return (req.ip || req.socket?.remoteAddress || "").replace(/^::ffff:/, "");
};

export const register = async (req: Request, res: Response) => {

  try {
    const { name, email, phone, password } = req.body;
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
    });

    if (user) {
      res.status(201).json({
        success: true,
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        phone: user.phone,
        isAdmin: user.isAdmin,
        profileImage: user.profileImage,
        bio: user.bio,
        token: generateToken((user._id as any).toString()),
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
  
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password as string))) {
      const ip = extractIp(req);
      if (ip) {
        user.lastKnownIp = ip;
        await user.save();
      }
      res.status(200).json({
        success: true,
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        phone: user.phone,
        isAdmin: user.isAdmin,
        isSeller: user.isSeller,
        profileImage: user.profileImage,
        bio: user.bio,
        customId: user.customId,
        token: generateToken((user._id as any).toString()),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getMe = async (req: any, res: Response) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      let orderCount = 0;
      if (user.isSeller) {
        orderCount = await Order.countDocuments({
          "orderItems.seller": user._id,
        });
      }

      res.status(200).json({
        success: true,
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        phone: user.phone,
        isAdmin: user.isAdmin,
        isSeller: user.isSeller,
        seller_type: user.seller_type,
        balance: user.balance,
        orderCount: orderCount,
        profileImage: user.profileImage,
        bio: user.bio,
        followers: user.followers,
        following: user.following,
        customId: user.customId,
        lastUsernameChange: user.lastUsernameChange,
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const setWithdrawPin = async (req: any, res: Response) => {
  try {
    const { pin } = req.body;
    
    if (!pin || pin.length !== 6) {
      return res.status(400).json({ message: "PIN must be 6 digits" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Hash the PIN
    const salt = await bcrypt.genSalt(10);
    user.withdrawPin = await bcrypt.hash(pin, salt);
    
    await user.save();

    res.status(200).json({ 
      success: true,
      message: "Withdrawal PIN set successfully" 
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

import nodemailer from "nodemailer";
import { sendSMS } from "../utils/smsService";

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { identity } = req.body;

    if (!identity) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Strictly find user by email
    const user = await User.findOne({ email: identity.toLowerCase() });

    if (!user) {
      return res.status(404).json({ message: "Account not found with this email" });
    }

    // Check for email credentials before sending
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error("CRITICAL: EMAIL_USER or EMAIL_PASS is missing in .env");
      return res.status(500).json({ 
        success: false, 
        message: "Email service is not configured correctly on the server." 
      });
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // Use SSL
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    // Send Email
    const mailOptions = {
      from: `"LALA Shop Support" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `Verification Code: ${otp} - LALA Shop`, // Putting OTP in subject can help
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px; margin: auto; padding: 40px; border: 1px solid #e0e0e0; border-radius: 20px; color: #333;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #000; margin: 0; font-size: 28px; font-weight: 900;">LALA SHOP</h1>
            <p style="color: #666; font-size: 14px;">Security Verification</p>
          </div>
          <p style="font-size: 16px; line-height: 1.6;">Hello,</p>
          <p style="font-size: 16px; line-height: 1.6;">We received a request to reset your password. Please use the following verification code:</p>
          <div style="background: #f9f9f9; padding: 25px; text-align: center; font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #000; border-radius: 15px; margin: 30px 0; border: 1px dashed #ccc;">
            ${otp}
          </div>
          <p style="font-size: 14px; color: #888; line-height: 1.6;">This code is valid for 15 minutes. If you did not request this, please ignore this email and your password will remain unchanged.</p>
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; font-size: 12px; color: #aaa;">
            &copy; ${new Date().getFullYear()} LALA Shop. All rights reserved.
          </div>
        </div>
      `,
    };

    try {
      console.log(`Attempting to send reset email to: ${user.email}`);
      const info = await transporter.sendMail(mailOptions);
      console.log(`Email sent successfully to ${user.email}. Response: ${info.response}`);
    } catch (mailError: any) {
      console.error("--- EMAIL SENDING FAILED ---");
      console.error("Recipient:", user.email);
      console.error("Error Code:", mailError.code);
      console.error("Error Message:", mailError.message);
      console.error("Check your EMAIL_USER and EMAIL_PASS in .env");
      console.error("-----------------------------");
      return res.status(500).json({ 
        success: false,
        message: "Failed to send reset email. This is usually due to incorrect SMTP (Email) configuration in the backend .env file." 
      });
    }

    res.status(200).json({
      success: true,
      message: "Verification code sent to your email",
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyResetCode = async (req: Request, res: Response) => {
  try {
    const { identity, otp } = req.body;

    if (!identity || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const user = await User.findOne({ email: identity.toLowerCase() });

    if (!user || user.otp !== otp || !user.otpExpires || new Date() > user.otpExpires) {
      return res.status(400).json({ message: "Invalid or expired verification code" });
    }

    res.status(200).json({
      success: true,
      message: "Code verified successfully",
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { identity, otp, password } = req.body;

    if (!identity || !otp || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const user = await User.findOne({ email: identity.toLowerCase() });

    if (!user || user.otp !== otp || !user.otpExpires || new Date() > user.otpExpires) {
      return res.status(400).json({ message: "Invalid session or code expired" });
    }

    // Set new password (the pre-save hook will hash it)
    user.password = password;
    user.otp = undefined; // Clear OTP
    user.otpExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successfully. You can now login.",
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "secret", {
    expiresIn: "30d",
  });
};
