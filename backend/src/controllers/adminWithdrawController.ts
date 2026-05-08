import { Request, Response } from "express";
import mongoose from "mongoose";
import Withdraw from "../models/withdrawModel";
import User from "../models/userModel";
import KycSubmission from "../models/kycSubmissionModel";

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
        .populate("processedBy", "name email customId")
        .lean(),
      Withdraw.countDocuments(filter),
    ]);

    // Batch-fetch shop names (from KYC submissions) for every seller in this
    // page. Cheaper than one KYC lookup per row, and the admin Withdrawals
    // table renders a clickable Shop column from this map.
    const sellerIds = Array.from(
      new Set(
        items
          .map((w: any) => w.user?._id?.toString())
          .filter(Boolean) as string[],
      ),
    );
    const shopNameById = new Map<string, string>();
    if (sellerIds.length > 0) {
      const kycs = await KycSubmission.find({
        user: { $in: sellerIds },
        status: "approved",
      })
        .select("user shopInfo.shopName shopInfo.shopAccount")
        .lean();
      // Approved KYC takes priority. Fall back to the most recent submission
      // (any status) for users who haven't been approved yet.
      const fallbackKycs = await KycSubmission.find({
        user: { $in: sellerIds },
      })
        .sort({ createdAt: -1 })
        .select("user shopInfo.shopName")
        .lean();
      for (const k of fallbackKycs) {
        const key = String(k.user);
        if (!shopNameById.has(key) && k.shopInfo?.shopName) {
          shopNameById.set(key, k.shopInfo.shopName);
        }
      }
      for (const k of kycs) {
        if (k.shopInfo?.shopName) shopNameById.set(String(k.user), k.shopInfo.shopName);
      }
    }

    // Surface bank info from snapshot fields when present; fall back to the
    // populated Bank doc for legacy rows. Admin renderer reads only
    // `bankAccount.bankName/accountNumber/accountName` regardless of source.
    const enriched = items.map((w: any) => {
      const populated = w.bankAccount && typeof w.bankAccount === "object" ? w.bankAccount : null;
      return {
        ...w,
        shopName: w.user?._id ? shopNameById.get(String(w.user._id)) || null : null,
        bankAccount: {
          _id: populated?._id || null,
          bankName: w.bankNameSnapshot || populated?.bankName || "",
          accountNumber: w.accountNumberSnapshot || populated?.accountNumber || "",
          accountName: w.accountNameSnapshot || populated?.accountName || "",
          isVerified: populated?.isVerified ?? false,
        },
      };
    });

    res.status(200).json({
      success: true,
      data: enriched,
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
    const item: any = await Withdraw.findById(id)
      .populate("user", "name email customId profileImage isSeller seller_type balance")
      .populate("bankAccount", "bankName accountNumber accountName isVerified")
      .populate("processedBy", "name email customId")
      .lean();
    if (!item) return res.status(404).json({ success: false, message: "Not found" });
    const populated = item.bankAccount && typeof item.bankAccount === "object" ? item.bankAccount : null;
    item.bankAccount = {
      _id: populated?._id || null,
      bankName: item.bankNameSnapshot || populated?.bankName || "",
      accountNumber: item.accountNumberSnapshot || populated?.accountNumber || "",
      accountName: item.accountNameSnapshot || populated?.accountName || "",
      isVerified: populated?.isVerified ?? false,
    };
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

    // Audit trail: stamp the admin who took this action so the Withdrawals
    // table can show "Processed by" for finance review.
    const adminId = (req as any).user?._id;
    if (adminId) item.processedBy = adminId;

    await item.save();

    res.status(200).json({
      success: true,
      data: {
        _id: item._id,
        status: item.status,
        reference: item.reference,
        adminNote: item.adminNote,
        processedAt: item.processedAt,
        processedBy: item.processedBy,
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
