import { Response } from "express";
import User from "../models/userModel";
import { IAuthRequest } from "../middlewares/authMiddleware";
import nodemailer from "nodemailer";
import { OTP } from "otplib";
import qrcode from "qrcode";

const authenticator = new OTP();

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// --- EMAIL 2FA ---

export const sendEmailOTP = async (req: IAuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    // Send Email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Your Soshop 2FA Code",
      text: `Your 2FA verification code is: ${otp}. It will expire in 10 minutes.`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ success: true, message: "OTP sent to your email" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyEmailOTP = async (req: IAuthRequest, res: Response) => {
  try {
    const { otp } = req.body;
    const user = await User.findById(req.user._id).select("+otp +otpExpires");

    if (!user || !user.otp || !user.otpExpires) {
      return res.status(400).json({ success: false, message: "OTP not requested or user not found" });
    }

    if (new Date() > user.otpExpires) {
      return res.status(400).json({ success: false, message: "OTP has expired" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    // Success: Enable Email 2FA
    user.twoFactorEnabled = true;
    user.twoFactorType = "email";
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.status(200).json({ success: true, message: "Email 2FA enabled successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- AUTHENTICATOR APP 2FA (TOTP) ---

export const setupTOTP = async (req: IAuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const secret = authenticator.generateSecret();
    const otpauth = authenticator.generateURI({
      issuer: "Soshop",
      label: user.email,
      secret: secret,
    });
    const qrCodeUrl = await qrcode.toDataURL(otpauth);

    // Temporarily store secret in user object (not enabled yet)
    user.twoFactorSecret = secret;
    await user.save();

    res.status(200).json({
      success: true,
      secret: secret,
      qrCode: qrCodeUrl,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyTOTP = async (req: IAuthRequest, res: Response) => {
  try {
    const { token } = req.body;
    const user = await User.findById(req.user._id).select("+twoFactorSecret");

    if (!user || !user.twoFactorSecret) {
      return res.status(400).json({ success: false, message: "2FA setup not initiated" });
    }

    const result = await authenticator.verify({
      token,
      secret: user.twoFactorSecret,
    });

    if (!result.valid) {
      return res.status(400).json({ success: false, message: "Invalid token" });
    }

    // Success: Enable Authenticator 2FA
    user.twoFactorEnabled = true;
    user.twoFactorType = "authenticator";
    await user.save();

    res.status(200).json({ success: true, message: "Authenticator 2FA enabled successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
