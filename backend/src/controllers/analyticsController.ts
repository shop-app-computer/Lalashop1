import { Response } from "express";
import mongoose from "mongoose";
import Order from "../models/orderModel";
import CreatorEarning from "../models/creatorEarningModel";
import CreatorProduct from "../models/creatorProductModel";
import { IAuthRequest } from "../middlewares/authMiddleware";

type Range = "today" | "7d" | "30d" | "all";

const rangeStart = (range: Range): Date | null => {
  const now = new Date();
  if (range === "today") {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    return d;
  }
  if (range === "7d") return new Date(now.getTime() - 7 * 86400000);
  if (range === "30d") return new Date(now.getTime() - 30 * 86400000);
  return null;
};

// GET /api/analytics/creator/me?range=today|7d|30d|all
export const getCreatorAnalytics = async (req: IAuthRequest, res: Response) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const range = ((req.query.range as string) || "today") as Range;
    const start = rangeStart(range);
    const creatorObjectId = new mongoose.Types.ObjectId(req.user._id);

    const matchPaid: any = {
      "orderItems.creator": creatorObjectId,
      isPaid: true,
    };
    if (start) matchPaid.paidAt = { $gte: start };

    const summaryAgg = await Order.aggregate([
      { $match: matchPaid },
      { $unwind: "$orderItems" },
      { $match: { "orderItems.creator": creatorObjectId } },
      {
        $group: {
          _id: null,
          revenue: {
            $sum: { $multiply: ["$orderItems.price", "$orderItems.qty"] },
          },
          commission: { $sum: "$orderItems.commission" },
          orders: { $addToSet: "$_id" },
          itemCount: { $sum: "$orderItems.qty" },
        },
      },
      {
        $project: {
          _id: 0,
          revenue: 1,
          commission: 1,
          itemCount: 1,
          orderCount: { $size: "$orders" },
        },
      },
    ]);

    const trendAgg = await Order.aggregate([
      { $match: matchPaid },
      { $unwind: "$orderItems" },
      { $match: { "orderItems.creator": creatorObjectId } },
      {
        $group: {
          _id: {
            $dateToString: {
              format: range === "today" ? "%H:00" : "%Y-%m-%d",
              date: "$paidAt",
            },
          },
          value: {
            $sum: { $multiply: ["$orderItems.price", "$orderItems.qty"] },
          },
          commission: { $sum: "$orderItems.commission" },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, name: "$_id", value: 1, commission: 1 } },
    ]);

    const topProductsAgg = await Order.aggregate([
      { $match: matchPaid },
      { $unwind: "$orderItems" },
      { $match: { "orderItems.creator": creatorObjectId } },
      {
        $group: {
          _id: "$orderItems.product",
          name: { $first: "$orderItems.name" },
          image: { $first: "$orderItems.image" },
          revenue: {
            $sum: { $multiply: ["$orderItems.price", "$orderItems.qty"] },
          },
          commission: { $sum: "$orderItems.commission" },
          qty: { $sum: "$orderItems.qty" },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 },
    ]);

    const earningsAgg = await CreatorEarning.aggregate([
      { $match: { creator: creatorObjectId } },
      {
        $group: {
          _id: "$status",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    const earnings: Record<string, { total: number; count: number }> = {
      pending: { total: 0, count: 0 },
      settled: { total: 0, count: 0 },
      canceled: { total: 0, count: 0 },
    };
    for (const row of earningsAgg) {
      earnings[row._id] = { total: row.total, count: row.count };
    }

    const productCount = await CreatorProduct.countDocuments({
      creator: creatorObjectId,
    });

    const summary = summaryAgg[0] || {
      revenue: 0,
      commission: 0,
      itemCount: 0,
      orderCount: 0,
    };

    res.status(200).json({
      success: true,
      data: {
        range,
        summary,
        trend: trendAgg,
        topProducts: topProductsAgg,
        earnings,
        productCount,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
