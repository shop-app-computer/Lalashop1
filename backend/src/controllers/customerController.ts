import { Response } from "express";
import { Types, isValidObjectId } from "mongoose";
import Order from "../models/orderModel";
import User from "../models/userModel";
import CustomerLabel from "../models/customerLabelModel";
import { IAuthRequest } from "../middlewares/authMiddleware";

const requireUser = (req: IAuthRequest, res: Response): string | null => {
  const id = req.user?._id?.toString();
  if (!id) {
    res.status(401).json({ success: false, message: "Not authenticated" });
    return null;
  }
  return id;
};

// Aggregate every distinct buyer who has ordered from this seller and roll up
// their purchase summary (count, total spend, last order). Pure derived data —
// nothing is materialized in a Customer collection.
export const listCustomers = async (req: IAuthRequest, res: Response) => {
  try {
    const shopId = requireUser(req, res);
    if (!shopId) return;

    const orders = await Order.find({ "orderItems.seller": shopId })
      .select("user totalPrice isPaid createdAt orderItems channel")
      .populate("user", "name username email profileImage createdAt")
      .lean();

    const map = new Map<
      string,
      {
        _id: string;
        name?: string;
        username?: string;
        email?: string;
        profileImage?: string;
        joinedAt?: Date;
        orderCount: number;
        paidOrderCount: number;
        totalSpent: number;
        lastOrderAt?: Date;
        channels: Set<string>;
      }
    >();

    for (const o of orders) {
      const buyer = o.user as unknown as {
        _id: Types.ObjectId;
        name?: string;
        username?: string;
        email?: string;
        profileImage?: string;
        createdAt?: Date;
      } | null;
      if (!buyer || !buyer._id) continue;
      const key = String(buyer._id);
      if (!map.has(key)) {
        map.set(key, {
          _id: key,
          name: buyer.name,
          username: buyer.username,
          email: buyer.email,
          profileImage: buyer.profileImage,
          joinedAt: buyer.createdAt,
          orderCount: 0,
          paidOrderCount: 0,
          totalSpent: 0,
          channels: new Set(),
        });
      }
      const row = map.get(key)!;
      row.orderCount += 1;
      const isPaid = (o as { isPaid?: boolean }).isPaid;
      if (isPaid) {
        row.paidOrderCount += 1;
        row.totalSpent += Number(o.totalPrice) || 0;
      }
      const created = (o as { createdAt?: Date }).createdAt;
      if (created && (!row.lastOrderAt || created > row.lastOrderAt)) {
        row.lastOrderAt = created;
      }
      const channel = (o as { channel?: string }).channel || "web";
      row.channels.add(channel);
    }

    const customerIds = Array.from(map.keys());
    const labels = await CustomerLabel.find({
      shop: shopId,
      customer: { $in: customerIds },
    }).lean();
    const labelMap = new Map(labels.map((l) => [String(l.customer), l]));

    const data = Array.from(map.values()).map((row) => {
      const label = labelMap.get(row._id);
      return {
        ...row,
        channels: Array.from(row.channels),
        tags: label?.tags || [],
        segment: label?.segment || "",
        note: label?.note || "",
      };
    });

    data.sort((a, b) => b.totalSpent - a.totalSpent);
    res.json({ success: true, data });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Server Error";
    res.status(500).json({ success: false, message: msg });
  }
};

// PUT /api/customers/:id/label
// Body: { tags?: string[], segment?: string, note?: string }
export const upsertLabel = async (req: IAuthRequest, res: Response) => {
  try {
    const shopId = requireUser(req, res);
    if (!shopId) return;
    const customerId = req.params.id;
    if (!isValidObjectId(customerId)) {
      res.status(400).json({ success: false, message: "Invalid customer id" });
      return;
    }

    // Defensive check that the buyer actually has an order with this shop —
    // prevents arbitrary label spam.
    const hasOrder = await Order.exists({
      user: customerId,
      "orderItems.seller": shopId,
    });
    if (!hasOrder) {
      res.status(404).json({ success: false, message: "Customer not found in this shop" });
      return;
    }

    const update: Partial<{ tags: string[]; segment: string; note: string }> = {};
    if (Array.isArray(req.body.tags)) update.tags = req.body.tags.map(String);
    if (typeof req.body.segment === "string") update.segment = req.body.segment;
    if (typeof req.body.note === "string") update.note = req.body.note;

    const doc = await CustomerLabel.findOneAndUpdate(
      { shop: shopId, customer: customerId },
      update,
      { new: true, upsert: true }
    );

    res.json({ success: true, data: doc });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Server Error";
    res.status(400).json({ success: false, message: msg });
  }
};

// GET /api/customers/:id/activity
// Returns this customer's order history with the current shop, plus profile.
export const getCustomerActivity = async (req: IAuthRequest, res: Response) => {
  try {
    const shopId = requireUser(req, res);
    if (!shopId) return;
    const customerId = req.params.id;
    if (!isValidObjectId(customerId)) {
      res.status(400).json({ success: false, message: "Invalid customer id" });
      return;
    }

    const [profile, orders, label] = await Promise.all([
      User.findById(customerId).select("name username email profileImage createdAt"),
      Order.find({ user: customerId, "orderItems.seller": shopId })
        .select("totalPrice isPaid status createdAt orderItems channel")
        .sort({ createdAt: -1 })
        .lean(),
      CustomerLabel.findOne({ shop: shopId, customer: customerId }),
    ]);

    if (!profile) {
      res.status(404).json({ success: false, message: "Customer not found" });
      return;
    }

    res.json({
      success: true,
      data: {
        profile,
        orders,
        label,
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Server Error";
    res.status(500).json({ success: false, message: msg });
  }
};

// GET /api/customers/segments — pre-computed segment counts for the shop.
export const getSegmentSummary = async (req: IAuthRequest, res: Response) => {
  try {
    const shopId = requireUser(req, res);
    if (!shopId) return;

    const orders = await Order.find({ "orderItems.seller": shopId })
      .select("user totalPrice isPaid createdAt")
      .lean();

    const buyers = new Map<
      string,
      { orderCount: number; totalSpent: number; lastOrderAt?: Date; firstOrderAt?: Date }
    >();
    for (const o of orders) {
      const uid = o.user ? String(o.user) : "";
      if (!uid) continue;
      if (!buyers.has(uid)) {
        buyers.set(uid, { orderCount: 0, totalSpent: 0 });
      }
      const row = buyers.get(uid)!;
      row.orderCount += 1;
      if ((o as { isPaid?: boolean }).isPaid) {
        row.totalSpent += Number(o.totalPrice) || 0;
      }
      const created = (o as { createdAt?: Date }).createdAt;
      if (created) {
        if (!row.lastOrderAt || created > row.lastOrderAt) row.lastOrderAt = created;
        if (!row.firstOrderAt || created < row.firstOrderAt) row.firstOrderAt = created;
      }
    }

    const now = Date.now();
    const ms30 = 30 * 86400000;
    const ms90 = 90 * 86400000;

    let vip = 0;
    let regular = 0;
    let newCustomers = 0;
    let inactive = 0;

    for (const row of buyers.values()) {
      if (row.totalSpent >= 5000) vip += 1;
      else if (row.orderCount >= 3) regular += 1;
      else if (row.firstOrderAt && now - row.firstOrderAt.getTime() < ms30) newCustomers += 1;
      if (row.lastOrderAt && now - row.lastOrderAt.getTime() > ms90) inactive += 1;
    }

    res.json({
      success: true,
      data: {
        total: buyers.size,
        vip,
        regular,
        newCustomers,
        inactive,
        totalRevenue: Array.from(buyers.values()).reduce((s, r) => s + r.totalSpent, 0),
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Server Error";
    res.status(500).json({ success: false, message: msg });
  }
};
