import { Response } from "express";
import bcrypt from "bcryptjs";
import Withdraw from "../models/withdrawModel";
import Bank from "../models/bankModel";
import User from "../models/userModel";
import { IAuthRequest } from "../middlewares/authMiddleware";

export const WITHDRAW_RULES = {
  minAmount: 100,
  maxAmount: 200000,
  feePercent: 0,
  flatFee: 0,
  processingDays: 7,
  currency: "THB",
};

export const getWithdrawRules = (_req: IAuthRequest, res: Response) => {
  res.status(200).json({ success: true, data: WITHDRAW_RULES });
};

const computeFee = (amount: number): number => {
  const pct = (amount * WITHDRAW_RULES.feePercent) / 100;
  return Math.max(0, pct + WITHDRAW_RULES.flatFee);
};

export const listMyWithdrawals = async (req: IAuthRequest, res: Response) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }
    const rows = await Withdraw.find({ user: req.user._id })
      .populate("bankAccount", "bankName accountNumber accountName")
      .sort({ createdAt: -1 })
      .limit(100);
    res.status(200).json({ success: true, data: rows });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createWithdrawal = async (req: IAuthRequest, res: Response) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const { amount, bankId, pin } = req.body;
    const numericAmount = Number(amount);

    if (!numericAmount || Number.isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ success: false, message: "Invalid amount" });
    }
    if (numericAmount < WITHDRAW_RULES.minAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum withdrawal is ${WITHDRAW_RULES.minAmount} ${WITHDRAW_RULES.currency}`,
      });
    }
    if (numericAmount > WITHDRAW_RULES.maxAmount) {
      return res.status(400).json({
        success: false,
        message: `Maximum withdrawal is ${WITHDRAW_RULES.maxAmount} ${WITHDRAW_RULES.currency}`,
      });
    }
    if (!bankId) {
      return res.status(400).json({ success: false, message: "bankId is required" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (!user.withdrawPin) {
      return res
        .status(400)
        .json({ success: false, message: "Please set your 6-digit withdrawal PIN first" });
    }
    if (!pin || pin.length !== 6) {
      return res.status(400).json({ success: false, message: "PIN must be 6 digits" });
    }
    const pinMatch = await bcrypt.compare(pin, user.withdrawPin);
    if (!pinMatch) {
      return res.status(401).json({ success: false, message: "Incorrect PIN" });
    }

    const bank = await Bank.findOne({ _id: bankId, user: req.user._id });
    if (!bank) {
      return res.status(404).json({ success: false, message: "Bank account not found" });
    }

    if ((user.balance || 0) < numericAmount) {
      return res.status(400).json({ success: false, message: "Insufficient balance" });
    }

    const fee = computeFee(numericAmount);
    const netAmount = numericAmount - fee;

    user.balance = (user.balance || 0) - numericAmount;
    await user.save();

    const created = await Withdraw.create({
      user: req.user._id,
      bankAccount: bank._id,
      amount: numericAmount,
      fee,
      netAmount,
      status: "pending",
    });

    const populated = await created.populate(
      "bankAccount",
      "bankName accountNumber accountName"
    );

    res.status(201).json({ success: true, data: populated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/withdraw/:id/cancel — user can cancel only while still pending; refunds balance.
export const cancelWithdrawal = async (req: IAuthRequest, res: Response) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }
    const tx = await Withdraw.findOne({ _id: req.params.id, user: req.user._id });
    if (!tx) {
      return res.status(404).json({ success: false, message: "Withdrawal not found" });
    }
    if (tx.status !== "pending") {
      return res
        .status(400)
        .json({ success: false, message: "Only pending withdrawals can be canceled" });
    }
    tx.status = "rejected";
    tx.adminNote = "Canceled by user";
    tx.processedAt = new Date();
    await tx.save();

    await User.findByIdAndUpdate(req.user._id, { $inc: { balance: tx.amount } });

    res.status(200).json({ success: true, data: tx });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
