import { Request, Response } from "express";
import mongoose from "mongoose";
import User from "../models/userModel";
import KycSubmission from "../models/kycSubmissionModel";
import Product from "../models/productModel";
import Order from "../models/orderModel";

interface ShopListQuery {
  page?: string;
  limit?: string;
  status?: "active" | "pending" | "closed" | "all";
  search?: string;
}

const parsePagination = (query: ShopListQuery) => {
  const page = Math.max(parseInt(query.page || "1", 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit || "50", 10) || 50, 1), 200);
  return { page, limit, skip: (page - 1) * limit };
};

export const adminListShops = async (req: Request, res: Response) => {
  try {
    const { page, limit, skip } = parsePagination(req.query as ShopListQuery);
    const { status, search } = req.query as ShopListQuery;

    const userFilter: Record<string, unknown> = { isSeller: true };

    if (search) {
      const safe = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const re = new RegExp(safe, "i");
      userFilter.$or = [{ name: re }, { email: re }, { customId: re }, { username: re }];
    }

    if (status === "closed") userFilter.seller_type = "closed";
    else if (status === "pending") userFilter.seller_type = { $in: [null, undefined, ""] };
    else if (status === "active") userFilter.seller_type = { $nin: [null, undefined, "", "closed"] };

    const [users, total] = await Promise.all([
      User.find(userFilter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("name email customId username profileImage seller_type isSeller balance createdAt")
        .lean(),
      User.countDocuments(userFilter),
    ]);

    const userIds = users.map((u) => u._id);

    const [kycList, productCounts, orderAgg] = await Promise.all([
      KycSubmission.find({ user: { $in: userIds } })
        .sort({ submittedAt: -1 })
        .lean(),
      Product.aggregate([
        { $match: { seller: { $in: userIds } } },
        { $group: { _id: "$seller", count: { $sum: 1 } } },
      ]),
      Order.aggregate([
        { $unwind: "$orderItems" },
        { $match: { "orderItems.seller": { $in: userIds }, isPaid: true } },
        {
          $group: {
            _id: "$orderItems.seller",
            revenue: { $sum: { $multiply: ["$orderItems.price", "$orderItems.qty"] } },
            ordersCount: { $sum: 1 },
          },
        },
      ]),
    ]);

    const kycByUser = new Map<string, any>();
    for (const k of kycList) {
      const key = (k.user as any).toString();
      if (!kycByUser.has(key)) kycByUser.set(key, k);
    }

    const productCountByUser = new Map<string, number>();
    for (const p of productCounts as any[]) {
      productCountByUser.set(p._id.toString(), p.count);
    }

    const revenueByUser = new Map<string, { revenue: number; ordersCount: number }>();
    for (const r of orderAgg as any[]) {
      revenueByUser.set(r._id.toString(), { revenue: r.revenue, ordersCount: r.ordersCount });
    }

    const data = users.map((u: any) => {
      const id = (u._id as any).toString();
      const kyc = kycByUser.get(id);
      const r = revenueByUser.get(id);
      return {
        _id: u._id,
        userId: u._id,
        customId: u.customId,
        ownerName: u.name,
        ownerEmail: u.email,
        ownerUsername: u.username,
        profileImage: u.profileImage,
        seller_type: u.seller_type,
        balance: u.balance,
        createdAt: u.createdAt,
        shopName: kyc?.shopInfo?.shopName ?? null,
        shopCategory: kyc?.shopInfo?.shopCategory ?? null,
        kycStatus: kyc?.status ?? null,
        productsCount: productCountByUser.get(id) ?? 0,
        revenue: r?.revenue ?? 0,
        ordersCount: r?.ordersCount ?? 0,
      };
    });

    res.status(200).json({
      success: true,
      data,
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const adminGetShop = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid id" });
    }
    const user = await User.findById(id)
      .select("-password -twoFactorSecret -otp -otpExpires -withdrawPin")
      .lean();
    if (!user) return res.status(404).json({ success: false, message: "Shop not found" });

    const [kyc, productsCount, ordersAgg] = await Promise.all([
      KycSubmission.findOne({ user: user._id }).sort({ submittedAt: -1 }).lean(),
      Product.countDocuments({ seller: user._id }),
      Order.aggregate([
        { $unwind: "$orderItems" },
        { $match: { "orderItems.seller": user._id, isPaid: true } },
        {
          $group: {
            _id: null,
            revenue: { $sum: { $multiply: ["$orderItems.price", "$orderItems.qty"] } },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    res.status(200).json({
      success: true,
      data: {
        ...user,
        kyc,
        productsCount,
        revenue: (ordersAgg[0] as any)?.revenue ?? 0,
        ordersCount: (ordersAgg[0] as any)?.count ?? 0,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const adminShopStats = async (_req: Request, res: Response) => {
  try {
    const [total, active, pending, closed] = await Promise.all([
      User.countDocuments({ isSeller: true }),
      User.countDocuments({ isSeller: true, seller_type: { $nin: [null, undefined, "", "closed"] } }),
      User.countDocuments({ isSeller: true, seller_type: { $in: [null, undefined, ""] } }),
      User.countDocuments({ isSeller: true, seller_type: "closed" }),
    ]);

    res.status(200).json({
      success: true,
      data: { total, active, pending, closed },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
