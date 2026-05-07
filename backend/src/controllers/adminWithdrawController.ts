import { Request, Response } from "express";
import mongoose from "mongoose";
import Withdraw from "../models/withdrawModel";
import User from "../models/userModel";

interface WithdrawListQuery {
  page?: string;
  limit?: string;
  status?: string;
  role?: "seller" | "creator" | "all";
  search?: string;
}

const parsePagination = (query: WithdrawListQuery) => {
  const page = Math.max(parseInt(query.page || "1", 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit || "50", 10) || 50, 1), 200);
  return { page, limit, skip: (page - 1) * limit };
};

export const adminListWithdrawals = async (req: Request, res: Response) => {
  try {
    const { page, limit, skip } = parsePagination(req.query as WithdrawListQuery);
    const { status, role, search } = req.query as WithdrawListQuery;

    const filter: Record<string, unknown> = {};
    if (status && status !== "all") filter.status = status;

    let userFilter: Record<string, unknown> | undefined;
    if (role === "seller") userFilter = { isSeller: true };
    else if (role === "creator") userFilter = { seller_type: "creator" };

    if (userFilter) {
      const userIds = await User.find(userFilter).select("_id").lean();
      filter.user = { $in: userIds.map((u) => u._id) };
    }

    if (search) {
      const safe = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const re = new RegExp(safe, "i");
      const matchedUsers = await User.find({
        $or: [{ name: re }, { email: re }, { customId: re }, { phone: re }],
      })
        .select("_id")
        .lean();
      const ids = matchedUsers.map((u) => u._id);
      const userClause: Record<string, unknown> = { user: { $in: ids } };
      if (filter.user && (filter.user as any).$in) {
        const intersect = (filter.user as any).$in.filter((id: any) =>
          ids.some((mid) => mid.toString() === id.toString())
        );
        filter.user = { $in: intersect };
      } else {
        Object.assign(filter, userClause);
      }
    }

    const [items, total] = await Promise.all([
      Withdraw.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("user", "name email customId profileImage isSeller seller_type")
        .populate("bankAccount", "bankName accountNumber accountName isVerified")
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

export const adminGetWithdrawal = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid id" });
    }
    const item = await Withdraw.findById(id)
      .populate("user", "name email customId profileImage isSeller seller_type balance")
      .populate("bankAccount", "bankName accountNumber accountName isVerified")
      .lean();
    if (!item) return res.status(404).json({ success: false, message: "Not found" });
    res.status(200).json({ success: true, data: item });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const adminProcessWithdrawal = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid id" });
    }

    const { decision, reference, adminNote } = req.body as {
      decision: "approve" | "reject" | "complete" | "fail";
      reference?: string;
      adminNote?: string;
    };

    const item = await Withdraw.findById(id);
    if (!item) return res.status(404).json({ success: false, message: "Not found" });

    switch (decision) {
      case "approve":
        item.status = "approved";
        break;
      case "reject":
        item.status = "rejected";
        // Refund the held amount back to the user's balance
        await User.findByIdAndUpdate(item.user, { $inc: { balance: item.amount } });
        break;
      case "complete":
        item.status = "completed";
        item.processedAt = new Date();
        if (reference) item.reference = reference;
        break;
      case "fail":
        item.status = "failed";
        await User.findByIdAndUpdate(item.user, { $inc: { balance: item.amount } });
        break;
      default:
        return res.status(400).json({ success: false, message: "Invalid decision" });
    }

    if (adminNote) item.adminNote = adminNote;

    await item.save();

    res.status(200).json({
      success: true,
      data: {
        _id: item._id,
        status: item.status,
        reference: item.reference,
        adminNote: item.adminNote,
        processedAt: item.processedAt,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const adminWithdrawStats = async (_req: Request, res: Response) => {
  try {
    const [pending, approved, completed, rejected, failed, totalsAgg] = await Promise.all([
      Withdraw.countDocuments({ status: "pending" }),
      Withdraw.countDocuments({ status: "approved" }),
      Withdraw.countDocuments({ status: "completed" }),
      Withdraw.countDocuments({ status: "rejected" }),
      Withdraw.countDocuments({ status: "failed" }),
      Withdraw.aggregate([
        {
          $group: {
            _id: "$status",
            total: { $sum: "$netAmount" },
          },
        },
      ]),
    ]);

    const totalsByStatus: Record<string, number> = {};
    for (const t of totalsAgg as any[]) totalsByStatus[t._id] = t.total;

    res.status(200).json({
      success: true,
      data: {
        pending,
        approved,
        completed,
        rejected,
        failed,
        totalsByStatus,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
