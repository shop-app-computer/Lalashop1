import { Request, Response } from "express";
import Notification from "../models/notificationModel";
import User from "../models/userModel";

interface NotifyListQuery {
  page?: string;
  limit?: string;
  type?: string;
  search?: string;
}

const parsePagination = (query: NotifyListQuery) => {
  const page = Math.max(parseInt(query.page || "1", 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit || "50", 10) || 50, 1), 200);
  return { page, limit, skip: (page - 1) * limit };
};

export const adminListNotifications = async (req: Request, res: Response) => {
  try {
    const { page, limit, skip } = parsePagination(req.query as NotifyListQuery);
    const { type, search } = req.query as NotifyListQuery;

    const filter: Record<string, unknown> = {};
    if (type && type !== "all") filter.type = type;
    if (search) {
      const safe = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const re = new RegExp(safe, "i");
      filter.$or = [{ title: re }, { body: re }];
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

export const adminBroadcastNotification = async (req: Request, res: Response) => {
  try {
    const { title, body, type, audience, link } = req.body as {
      title: string;
      body: string;
      type?: "system" | "security" | "info" | "payout";
      audience?: "all" | "sellers" | "buyers" | "creators";
      link?: string;
    };

    if (!title || typeof title !== "string") {
      return res.status(400).json({ success: false, message: "title required" });
    }

    let userFilter: Record<string, unknown> = {};
    if (audience === "sellers") userFilter = { isSeller: true };
    else if (audience === "buyers") userFilter = { isSeller: { $ne: true } };
    else if (audience === "creators") userFilter = { seller_type: "creator" };

    const recipients = await User.find(userFilter).select("_id").lean();
    if (recipients.length === 0) {
      return res.status(200).json({ success: true, data: { sent: 0 } });
    }

    const docs = recipients.map((r) => ({
      user: r._id,
      type: type || "system",
      title,
      body: body || "",
      link,
    }));
    await Notification.insertMany(docs, { ordered: false });

    res.status(201).json({
      success: true,
      data: { sent: docs.length, audience: audience || "all" },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const adminNotificationStats = async (_req: Request, res: Response) => {
  try {
    const [total, unread, byType] = await Promise.all([
      Notification.countDocuments({}),
      Notification.countDocuments({ read: false }),
      Notification.aggregate([
        { $group: { _id: "$type", count: { $sum: 1 } } },
      ]),
    ]);

    const typeCounts: Record<string, number> = {};
    for (const t of byType as any[]) typeCounts[t._id] = t.count;

    res.status(200).json({ success: true, data: { total, unread, byType: typeCounts } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
