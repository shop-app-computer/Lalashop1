import { Request, Response } from "express";
import mongoose from "mongoose";
import Report from "../models/reportModel";
import { IAuthRequest } from "../middlewares/authMiddleware";

interface ListQuery {
  page?: string;
  limit?: string;
  search?: string;
  status?: string;
  reason?: string;
  targetType?: string;
  targetId?: string;
}

const parsePagination = (query: ListQuery) => {
  const page = Math.max(parseInt(query.page || "1", 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit || "50", 10) || 50, 1), 200);
  return { page, limit, skip: (page - 1) * limit };
};

const buildFilter = (query: ListQuery): Record<string, unknown> => {
  const filter: Record<string, unknown> = {};
  if (query.status && query.status !== "all") filter.status = query.status;
  if (query.reason && query.reason !== "all") filter.reason = query.reason;
  if (query.targetType && query.targetType !== "all") filter.targetType = query.targetType;
  if (query.targetId && mongoose.isValidObjectId(query.targetId)) {
    filter.targetId = new mongoose.Types.ObjectId(query.targetId);
  }
  if (query.search) {
    const safe = query.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(safe, "i");
    filter.$or = [{ description: re }, { adminNote: re }];
  }
  return filter;
};

// ─── Public: user submits a report ─────────────────────────────────────

export const createReport = async (req: IAuthRequest, res: Response) => {
  try {
    const { targetType, targetId, reason, description, evidence } = req.body as {
      targetType: string;
      targetId: string;
      reason: string;
      description?: string;
      evidence?: string[];
    };

    const allowedTargets = ["user", "shop", "product", "post", "comment"];
    const allowedReasons = ["spam", "abuse", "fraud", "counterfeit", "harassment", "other"];

    if (!allowedTargets.includes(targetType)) {
      return res.status(400).json({ success: false, message: "Invalid targetType" });
    }
    if (!allowedReasons.includes(reason)) {
      return res.status(400).json({ success: false, message: "Invalid reason" });
    }
    if (!mongoose.isValidObjectId(targetId)) {
      return res.status(400).json({ success: false, message: "Invalid targetId" });
    }
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const report = await Report.create({
      targetType,
      targetId: new mongoose.Types.ObjectId(targetId),
      reportedBy: req.user._id,
      reason,
      description: typeof description === "string" ? description.trim() : "",
      evidence: Array.isArray(evidence) ? evidence.filter((e) => typeof e === "string") : [],
    });

    res.status(201).json({ success: true, data: report });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Admin endpoints ─────────────────────────────────────────────────

export const adminListReports = async (req: Request, res: Response) => {
  try {
    const { page, limit, skip } = parsePagination(req.query as ListQuery);
    const filter = buildFilter(req.query as ListQuery);

    const [items, total] = await Promise.all([
      Report.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("reportedBy", "name email customId profileImage")
        .populate("assignedTo", "name email customId")
        .populate("reviewedBy", "name email customId")
        .lean(),
      Report.countDocuments(filter),
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

export const adminGetReport = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid id" });
    }
    const report = await Report.findById(id)
      .populate("reportedBy", "name email customId profileImage")
      .populate("assignedTo", "name email customId")
      .populate("reviewedBy", "name email customId")
      .lean();
    if (!report) {
      return res.status(404).json({ success: false, message: "Report not found" });
    }
    res.status(200).json({ success: true, data: report });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const adminUpdateReport = async (req: IAuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid id" });
    }

    const { status, actionTaken, adminNote, assignedTo } = req.body as {
      status?: string;
      actionTaken?: string;
      adminNote?: string;
      assignedTo?: string | null;
    };

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ success: false, message: "Report not found" });
    }

    const allowedStatus = ["open", "reviewing", "actioned", "dismissed"];
    const allowedAction = ["none", "warn", "remove", "suspend", "ban"];

    if (typeof status === "string") {
      if (!allowedStatus.includes(status)) {
        return res.status(400).json({ success: false, message: "Invalid status" });
      }
      report.status = status as any;
      if (status === "actioned" || status === "dismissed") {
        report.reviewedAt = new Date();
        if (req.user?._id) report.reviewedBy = req.user._id as any;
      }
    }

    if (typeof actionTaken === "string") {
      if (!allowedAction.includes(actionTaken)) {
        return res.status(400).json({ success: false, message: "Invalid actionTaken" });
      }
      report.actionTaken = actionTaken as any;
    }

    if (typeof adminNote === "string") {
      report.adminNote = adminNote;
    }

    if (assignedTo === null) {
      report.assignedTo = undefined;
    } else if (typeof assignedTo === "string" && mongoose.isValidObjectId(assignedTo)) {
      report.assignedTo = new mongoose.Types.ObjectId(assignedTo) as any;
    }

    await report.save();

    const populated = await Report.findById(report._id)
      .populate("reportedBy", "name email customId profileImage")
      .populate("assignedTo", "name email customId")
      .populate("reviewedBy", "name email customId")
      .lean();

    res.status(200).json({ success: true, data: populated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const adminReportStats = async (_req: Request, res: Response) => {
  try {
    const [total, open, reviewing, actioned, dismissed, byReason, byTargetType] = await Promise.all([
      Report.countDocuments({}),
      Report.countDocuments({ status: "open" }),
      Report.countDocuments({ status: "reviewing" }),
      Report.countDocuments({ status: "actioned" }),
      Report.countDocuments({ status: "dismissed" }),
      Report.aggregate([{ $group: { _id: "$reason", count: { $sum: 1 } } }]),
      Report.aggregate([{ $group: { _id: "$targetType", count: { $sum: 1 } } }]),
    ]);

    const reasonCounts: Record<string, number> = {};
    for (const r of byReason as any[]) reasonCounts[r._id] = r.count;
    const targetCounts: Record<string, number> = {};
    for (const r of byTargetType as any[]) targetCounts[r._id] = r.count;

    res.status(200).json({
      success: true,
      data: {
        total,
        open,
        reviewing,
        actioned,
        dismissed,
        byReason: reasonCounts,
        byTargetType: targetCounts,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
