import { Response } from "express";
import { Types } from "mongoose";
import Coupon from "../models/couponModel";
import Promotion from "../models/promotionModel";
import Broadcast from "../models/broadcastModel";
import Notification from "../models/notificationModel";
import User from "../models/userModel";
import Order from "../models/orderModel";
import { IAuthRequest } from "../middlewares/authMiddleware";

const requireUser = (req: IAuthRequest, res: Response): string | null => {
  const id = req.user?._id?.toString();
  if (!id) {
    res.status(401).json({ success: false, message: "Not authenticated" });
    return null;
  }
  return id;
};

// ============ COUPONS ============

export const listCoupons = async (req: IAuthRequest, res: Response) => {
  try {
    const shopId = requireUser(req, res);
    if (!shopId) return;
    const items = await Coupon.find({ shop: shopId }).sort({ createdAt: -1 });
    res.json({ success: true, data: items });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Server Error";
    res.status(500).json({ success: false, message: msg });
  }
};

export const getCoupon = async (req: IAuthRequest, res: Response) => {
  try {
    const shopId = requireUser(req, res);
    if (!shopId) return;
    const item = await Coupon.findOne({ _id: req.params.id, shop: shopId });
    if (!item) {
      res.status(404).json({ success: false, message: "Coupon not found" });
      return;
    }
    res.json({ success: true, data: item });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Server Error";
    res.status(500).json({ success: false, message: msg });
  }
};

export const createCoupon = async (req: IAuthRequest, res: Response) => {
  try {
    const shopId = requireUser(req, res);
    if (!shopId) return;
    const data = { ...req.body, shop: shopId, code: String(req.body.code || "").toUpperCase() };
    const item = await Coupon.create(data);
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Server Error";
    res.status(400).json({ success: false, message: msg });
  }
};

export const updateCoupon = async (req: IAuthRequest, res: Response) => {
  try {
    const shopId = requireUser(req, res);
    if (!shopId) return;
    const data = { ...req.body };
    if (data.code) data.code = String(data.code).toUpperCase();
    delete data.shop;
    delete data.usedCount;
    const item = await Coupon.findOneAndUpdate(
      { _id: req.params.id, shop: shopId },
      data,
      { new: true }
    );
    if (!item) {
      res.status(404).json({ success: false, message: "Coupon not found" });
      return;
    }
    res.json({ success: true, data: item });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Server Error";
    res.status(400).json({ success: false, message: msg });
  }
};

export const deleteCoupon = async (req: IAuthRequest, res: Response) => {
  try {
    const shopId = requireUser(req, res);
    if (!shopId) return;
    const item = await Coupon.findOneAndDelete({ _id: req.params.id, shop: shopId });
    if (!item) {
      res.status(404).json({ success: false, message: "Coupon not found" });
      return;
    }
    res.json({ success: true, data: { _id: item._id } });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Server Error";
    res.status(500).json({ success: false, message: msg });
  }
};

// ============ PROMOTIONS ============

export const listPromotions = async (req: IAuthRequest, res: Response) => {
  try {
    const shopId = requireUser(req, res);
    if (!shopId) return;
    const items = await Promotion.find({ shop: shopId })
      .populate("productIds", "name image price")
      .sort({ createdAt: -1 });
    res.json({ success: true, data: items });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Server Error";
    res.status(500).json({ success: false, message: msg });
  }
};

export const getPromotion = async (req: IAuthRequest, res: Response) => {
  try {
    const shopId = requireUser(req, res);
    if (!shopId) return;
    const item = await Promotion.findOne({ _id: req.params.id, shop: shopId }).populate(
      "productIds",
      "name image price"
    );
    if (!item) {
      res.status(404).json({ success: false, message: "Promotion not found" });
      return;
    }
    res.json({ success: true, data: item });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Server Error";
    res.status(500).json({ success: false, message: msg });
  }
};

export const createPromotion = async (req: IAuthRequest, res: Response) => {
  try {
    const shopId = requireUser(req, res);
    if (!shopId) return;
    const item = await Promotion.create({ ...req.body, shop: shopId });
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Server Error";
    res.status(400).json({ success: false, message: msg });
  }
};

export const updatePromotion = async (req: IAuthRequest, res: Response) => {
  try {
    const shopId = requireUser(req, res);
    if (!shopId) return;
    const data = { ...req.body };
    delete data.shop;
    delete data.views;
    delete data.orders;
    delete data.revenue;
    const item = await Promotion.findOneAndUpdate(
      { _id: req.params.id, shop: shopId },
      data,
      { new: true }
    );
    if (!item) {
      res.status(404).json({ success: false, message: "Promotion not found" });
      return;
    }
    res.json({ success: true, data: item });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Server Error";
    res.status(400).json({ success: false, message: msg });
  }
};

export const deletePromotion = async (req: IAuthRequest, res: Response) => {
  try {
    const shopId = requireUser(req, res);
    if (!shopId) return;
    const item = await Promotion.findOneAndDelete({ _id: req.params.id, shop: shopId });
    if (!item) {
      res.status(404).json({ success: false, message: "Promotion not found" });
      return;
    }
    res.json({ success: true, data: { _id: item._id } });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Server Error";
    res.status(500).json({ success: false, message: msg });
  }
};

// ============ BROADCASTS ============

const resolveAudience = async (
  shopId: string,
  audience: string
): Promise<Types.ObjectId[]> => {
  if (audience === "all_customers") {
    const orders = await Order.find({ "items.shop": shopId }).select("user").lean();
    const ids = new Set<string>();
    for (const o of orders) if (o.user) ids.add(String(o.user));
    return Array.from(ids).map((id) => new Types.ObjectId(id));
  }
  if (audience === "all_followers") {
    const shop = await User.findById(shopId).select("followers").lean();
    const followers = ((shop as { followers?: Types.ObjectId[] } | null)?.followers) || [];
    return followers;
  }
  return [];
};

export const listBroadcasts = async (req: IAuthRequest, res: Response) => {
  try {
    const shopId = requireUser(req, res);
    if (!shopId) return;
    const items = await Broadcast.find({ shop: shopId }).sort({ createdAt: -1 });
    res.json({ success: true, data: items });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Server Error";
    res.status(500).json({ success: false, message: msg });
  }
};

export const createBroadcast = async (req: IAuthRequest, res: Response) => {
  try {
    const shopId = requireUser(req, res);
    if (!shopId) return;
    const recipients = await resolveAudience(shopId, req.body.audience || "all_customers");
    const item = await Broadcast.create({
      ...req.body,
      shop: shopId,
      audienceCount: recipients.length,
      status: "draft",
    });
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Server Error";
    res.status(400).json({ success: false, message: msg });
  }
};

export const sendBroadcast = async (req: IAuthRequest, res: Response) => {
  try {
    const shopId = requireUser(req, res);
    if (!shopId) return;

    // Atomic claim — flips the broadcast from a non-sent state to "sent"
    // BEFORE we fan out notifications. Without this, double-clicking "send"
    // would call insertMany twice and every recipient gets the same
    // notification two (or more) times.
    const broadcast = await Broadcast.findOneAndUpdate(
      {
        _id: req.params.id,
        shop: shopId,
        status: { $in: ["draft", "scheduled", "failed"] },
      },
      { $set: { status: "sent", sentAt: new Date() } },
      { new: true },
    );
    if (!broadcast) {
      const existing = await Broadcast.findOne({ _id: req.params.id, shop: shopId });
      if (!existing) {
        res.status(404).json({ success: false, message: "Broadcast not found" });
        return;
      }
      res.status(400).json({
        success: false,
        message: `Cannot send a broadcast in status "${existing.status}"`,
      });
      return;
    }

    const recipients = await resolveAudience(shopId, broadcast.audience);
    if (broadcast.channel === "in_app") {
      const docs = recipients.map((uid) => ({
        user: uid,
        type: "broadcast",
        title: broadcast.title,
        body: broadcast.body,
        link: broadcast.link || "",
        metadata: { shop: shopId, broadcastId: broadcast._id },
      }));
      if (docs.length > 0) await Notification.insertMany(docs);
    }
    broadcast.audienceCount = recipients.length;
    broadcast.metrics.delivered = recipients.length;
    await broadcast.save();
    res.json({ success: true, data: broadcast });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Server Error";
    res.status(500).json({ success: false, message: msg });
  }
};

export const deleteBroadcast = async (req: IAuthRequest, res: Response) => {
  try {
    const shopId = requireUser(req, res);
    if (!shopId) return;
    const item = await Broadcast.findOneAndDelete({ _id: req.params.id, shop: shopId });
    if (!item) {
      res.status(404).json({ success: false, message: "Broadcast not found" });
      return;
    }
    res.json({ success: true, data: { _id: item._id } });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Server Error";
    res.status(500).json({ success: false, message: msg });
  }
};
