import { Request, Response } from "express";
import mongoose from "mongoose";
import Order from "../models/orderModel";
import Withdraw from "../models/withdrawModel";
import User from "../models/userModel";
import Bank from "../models/bankModel";
import KycSubmission from "../models/kycSubmissionModel";
import Notification from "../models/notificationModel";

interface ListQuery {
  page?: string;
  limit?: string;
  user?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}

const parsePagination = (query: ListQuery) => {
  const page = Math.max(parseInt(query.page || "1", 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit || "50", 10) || 50, 1), 200);
  return { page, limit, skip: (page - 1) * limit };
};

const dateFilter = (q: ListQuery): Record<string, Date> | null => {
  const r: Record<string, Date> = {};
  if (q.startDate) r.$gte = new Date(q.startDate);
  if (q.endDate) r.$lte = new Date(q.endDate);
  return Object.keys(r).length === 0 ? null : r;
};

const userScopeFilter = (q: ListQuery): Record<string, unknown> => {
  const filter: Record<string, unknown> = {};
  if (q.user && mongoose.isValidObjectId(q.user)) {
    filter.user = new mongoose.Types.ObjectId(q.user);
  }
  const range = dateFilter(q);
  if (range) filter.createdAt = range;
  return filter;
};

// Orders history
export const historyOrders = async (req: Request, res: Response) => {
  try {
    const { page, limit, skip } = parsePagination(req.query as ListQuery);
    const filter = userScopeFilter(req.query as ListQuery);

    const [items, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("status totalPrice paymentMethod isPaid isDelivered orderItems createdAt user")
        .populate("user", "name email customId")
        .lean(),
      Order.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: items,
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Transactions = paid orders + completed withdrawals
export const historyTransactions = async (req: Request, res: Response) => {
  try {
    const { page, limit, skip } = parsePagination(req.query as ListQuery);
    const userId = (req.query as ListQuery).user;
    const range = dateFilter(req.query as ListQuery);

    const baseUserMatch: Record<string, unknown> = {};
    if (userId && mongoose.isValidObjectId(userId)) {
      baseUserMatch.user = new mongoose.Types.ObjectId(userId);
    }
    if (range) baseUserMatch.createdAt = range;

    const [paidOrders, withdrawals] = await Promise.all([
      Order.find({ ...baseUserMatch, isPaid: true })
        .sort({ createdAt: -1 })
        .limit(limit * 2)
        .select("totalPrice paymentMethod paidAt createdAt user")
        .populate("user", "name email customId")
        .lean(),
      Withdraw.find(baseUserMatch)
        .sort({ createdAt: -1 })
        .limit(limit * 2)
        .populate("user", "name email customId")
        .lean(),
    ]);

    const merged = [
      ...paidOrders.map((o: any) => ({
        kind: "order" as const,
        _id: o._id,
        amount: o.totalPrice,
        method: o.paymentMethod,
        date: o.paidAt || o.createdAt,
        user: o.user,
      })),
      ...withdrawals.map((w: any) => ({
        kind: "withdrawal" as const,
        _id: w._id,
        amount: -w.netAmount,
        method: "Withdraw",
        date: w.processedAt || w.createdAt,
        user: w.user,
        status: w.status,
      })),
    ]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(skip, skip + limit);

    res.status(200).json({
      success: true,
      data: merged,
      meta: { total: merged.length, page, limit, pages: 1 },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Withdrawals history
export const historyWithdrawals = async (req: Request, res: Response) => {
  try {
    const { page, limit, skip } = parsePagination(req.query as ListQuery);
    const filter = userScopeFilter(req.query as ListQuery);

    const [items, total] = await Promise.all([
      Withdraw.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("user", "name email customId")
        .populate("bankAccount", "bankName accountNumber accountName")
        .lean(),
      Withdraw.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: items,
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Bank account changes - shows current bank records (no audit log model exists yet)
export const historyBankChanges = async (req: Request, res: Response) => {
  try {
    const { page, limit, skip } = parsePagination(req.query as ListQuery);
    const filter: Record<string, unknown> = {};
    const userId = (req.query as ListQuery).user;
    if (userId && mongoose.isValidObjectId(userId)) {
      filter.user = new mongoose.Types.ObjectId(userId);
    }

    const [items, total] = await Promise.all([
      Bank.find(filter)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("user", "name email customId")
        .lean(),
      Bank.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: items,
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// KYC history
export const historyKyc = async (req: Request, res: Response) => {
  try {
    const { page, limit, skip } = parsePagination(req.query as ListQuery);
    const filter = userScopeFilter(req.query as ListQuery);

    const [items, total] = await Promise.all([
      KycSubmission.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("user", "name email customId")
        .lean(),
      KycSubmission.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: items,
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Login & device history - using lastKnownIp + updatedAt as a proxy
export const historyLoginDevice = async (req: Request, res: Response) => {
  try {
    const { page, limit, skip } = parsePagination(req.query as ListQuery);
    const filter: Record<string, unknown> = {};
    const userId = (req.query as ListQuery).user;
    if (userId && mongoose.isValidObjectId(userId)) {
      filter._id = new mongoose.Types.ObjectId(userId);
    }

    const [items, total] = await Promise.all([
      User.find(filter)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("name email customId lastKnownIp updatedAt createdAt")
        .lean(),
      User.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: items,
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Linked accounts - users with googleId or facebookId
export const historyLinkedAccounts = async (req: Request, res: Response) => {
  try {
    const { page, limit, skip } = parsePagination(req.query as ListQuery);
    const filter: Record<string, unknown> = {
      $or: [
        { googleId: { $exists: true, $ne: null } },
        { facebookId: { $exists: true, $ne: null } },
      ],
    };
    const userId = (req.query as ListQuery).user;
    if (userId && mongoose.isValidObjectId(userId)) {
      (filter as any)._id = new mongoose.Types.ObjectId(userId);
    }

    const [items, total] = await Promise.all([
      User.find(filter)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("name email customId googleId facebookId")
        .lean(),
      User.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: items,
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Edit logs - notifications of type "system" with metadata
export const historyEditLogs = async (req: Request, res: Response) => {
  try {
    const { page, limit, skip } = parsePagination(req.query as ListQuery);
    const filter: Record<string, unknown> = { type: { $in: ["system", "security"] } };
    const userId = (req.query as ListQuery).user;
    if (userId && mongoose.isValidObjectId(userId)) {
      filter.user = new mongoose.Types.ObjectId(userId);
    }

    const [items, total] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("user", "name email customId")
        .lean(),
      Notification.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: items,
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Deposit sources - paid orders grouped by payment method
export const historyDepositSources = async (req: Request, res: Response) => {
  try {
    const range = dateFilter(req.query as ListQuery);
    const match: Record<string, unknown> = { isPaid: true };
    if (range) match.paidAt = range;

    const items = await Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$paymentMethod",
          count: { $sum: 1 },
          total: { $sum: "$totalPrice" },
        },
      },
      { $sort: { total: -1 } },
    ]);

    res.status(200).json({ success: true, data: items });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Risk signals - users with multiple failed/rejected withdrawals
export const historyRiskSignals = async (_req: Request, res: Response) => {
  try {
    const items = await Withdraw.aggregate([
      { $match: { status: { $in: ["rejected", "failed"] } } },
      {
        $group: {
          _id: "$user",
          count: { $sum: 1 },
          lastAt: { $max: "$createdAt" },
          totalRejected: { $sum: "$amount" },
        },
      },
      { $match: { count: { $gte: 2 } } },
      { $sort: { count: -1 } },
      { $limit: 100 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          count: 1,
          lastAt: 1,
          totalRejected: 1,
          "user._id": 1,
          "user.name": 1,
          "user.email": 1,
          "user.customId": 1,
        },
      },
    ]);

    res.status(200).json({ success: true, data: items });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Financial summary (per user or platform)
export const historyFinancial = async (req: Request, res: Response) => {
  try {
    const userId = (req.query as ListQuery).user;
    const matchOrders: Record<string, unknown> = { isPaid: true };
    const matchWithdraws: Record<string, unknown> = {};
    if (userId && mongoose.isValidObjectId(userId)) {
      matchOrders.user = new mongoose.Types.ObjectId(userId);
      matchWithdraws.user = new mongoose.Types.ObjectId(userId);
    }

    const [revenueAgg, withdrawAgg] = await Promise.all([
      Order.aggregate([
        { $match: matchOrders },
        { $group: { _id: null, total: { $sum: "$totalPrice" }, count: { $sum: 1 } } },
      ]),
      Withdraw.aggregate([
        { $match: matchWithdraws },
        { $group: { _id: "$status", total: { $sum: "$netAmount" }, count: { $sum: 1 } } },
      ]),
    ]);

    const withdrawByStatus: Record<string, { total: number; count: number }> = {};
    for (const w of withdrawAgg as any[]) withdrawByStatus[w._id] = { total: w.total, count: w.count };

    res.status(200).json({
      success: true,
      data: {
        revenue: (revenueAgg[0] as any)?.total ?? 0,
        ordersPaid: (revenueAgg[0] as any)?.count ?? 0,
        withdrawals: withdrawByStatus,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Support tickets — placeholder until support model is added
export const historySupport = async (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: [],
    meta: { total: 0, page: 1, limit: 0, pages: 0 },
    message: "Support model not implemented yet",
  });
};

// Admin audit — placeholder until admin audit model is added
export const historyAdminAudit = async (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: [],
    meta: { total: 0, page: 1, limit: 0, pages: 0 },
    message: "Admin audit model not implemented yet",
  });
};
