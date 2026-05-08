import { Response } from "express";
import bcrypt from "bcryptjs";
import Withdraw from "../models/withdrawModel";
import User from "../models/userModel";
import KycSubmission from "../models/kycSubmissionModel";
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
      // Legacy records still reference Bank — populate so admins/sellers
      // viewing old withdrawals see the original bank info. New records use
      // the snapshot fields directly and the populate is a no-op.
      .populate("bankAccount", "bankName accountNumber accountName")
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    // Surface a unified shape: prefer snapshot fields, fall back to populated
    // Bank for legacy rows. The customer's withdraw history reads only the
    // resolved shape so the UI doesn't need to handle both.
    const shaped = rows.map((w: any) => {
      const populated = w.bankAccount && typeof w.bankAccount === "object" ? w.bankAccount : null;
      return {
        ...w,
        bankAccount: {
          bankName: w.bankNameSnapshot || populated?.bankName || "",
          accountNumber: w.accountNumberSnapshot || populated?.accountNumber || "",
          accountName: w.accountNameSnapshot || populated?.accountName || "",
        },
      };
    });
    res.status(200).json({ success: true, data: shaped });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createWithdrawal = async (req: IAuthRequest, res: Response) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    // bankId is no longer accepted from the client. Withdrawals are locked
    // to the seller's KYC bank account; we snapshot bankName + accountNumber
    // + accountName into the Withdraw record so admin views don't depend on
    // any external Bank document.
    const { amount, pin } = req.body;
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

    // Resolve the shop's payout bank from KYC. Prefer approved KYC, fall
    // back to the most recent submission so a seller can still withdraw
    // while their KYC is under review (the shopInfo is filled either way).
    const kyc =
      (await KycSubmission.findOne({ user: req.user._id, status: "approved" }).sort({
        createdAt: -1,
      })) ||
      (await KycSubmission.findOne({ user: req.user._id }).sort({ createdAt: -1 }));
    if (!kyc || !kyc.shopInfo?.shopAccount) {
      return res.status(400).json({
        success: false,
        message:
          "No shop bank account on file — open your shop / complete KYC first to add a payout account.",
      });
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
      bankNameSnapshot: kyc.shopInfo.bankName || "",
      accountNumberSnapshot: kyc.shopInfo.shopAccount || "",
      accountNameSnapshot: kyc.shopInfo.shopName || "",
      amount: numericAmount,
      fee,
      netAmount,
      status: "pending",
    });

    res.status(201).json({ success: true, data: created });
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
