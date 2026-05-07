import { Request, Response } from "express";
import CreatorProduct from "../models/creatorProductModel";
import AffiliateClick from "../models/affiliateClickModel";
import { IAuthRequest } from "../middlewares/authMiddleware";

const FRONTEND_BASE = process.env.FRONTEND_URL || "http://localhost:3000";

// GET /r/:code  (mounted at root in app.ts)
// Records the click, sets a tracking cookie, redirects to product page.
export const trackAndRedirect = async (req: IAuthRequest, res: Response) => {
  try {
    const { code } = req.params;
    const row = await CreatorProduct.findOne({ affiliateCode: code }).populate(
      "product",
      "_id cookieDays"
    );

    if (!row || !row.product) {
      return res.redirect(FRONTEND_BASE);
    }

    const productId = (row.product as any)._id.toString();
    const cookieDays = (row.product as any).cookieDays || 30;
    const expiresAt = new Date(Date.now() + cookieDays * 24 * 60 * 60 * 1000);

    await AffiliateClick.create({
      creator: row.creator,
      product: row.product,
      affiliateCode: code,
      visitor: req.user?._id,
      ip: req.ip,
      userAgent: req.headers["user-agent"] || "",
      referrer: (req.headers.referer || req.headers.referrer || "") as string,
      expiresAt,
    });

    await CreatorProduct.updateOne({ _id: row._id }, { $inc: { clicks: 1 } });

    // Cookie: stores affiliate code per visitor for attribution at checkout time.
    res.cookie(`aff_${productId}`, code, {
      maxAge: cookieDays * 24 * 60 * 60 * 1000,
      httpOnly: false,
      sameSite: "lax",
    });

    return res.redirect(`${FRONTEND_BASE}/products/${productId}?ref=${code}`);
  } catch (error: any) {
    return res.redirect(FRONTEND_BASE);
  }
};

// POST /api/affiliate/attribute
// Body: { productId, affiliateCode? } — optional client-side hint when cookies not available.
// Returns a server-confirmed attribution payload that the order should embed.
export const attributeProduct = async (req: IAuthRequest, res: Response) => {
  try {
    const { productId, affiliateCode } = req.body;
    if (!productId) {
      return res.status(400).json({ success: false, message: "productId is required" });
    }

    let code = affiliateCode || req.cookies?.[`aff_${productId}`];
    if (!code) {
      return res.status(200).json({ success: true, data: null });
    }

    const row = await CreatorProduct.findOne({ affiliateCode: code }).populate(
      "product",
      "_id commissionType commissionValue"
    );
    if (!row || (row.product as any)._id.toString() !== productId.toString()) {
      return res.status(200).json({ success: true, data: null });
    }

    res.status(200).json({
      success: true,
      data: {
        creator: row.creator,
        affiliateCode: code,
        commissionType: (row.product as any).commissionType,
        commissionValue: (row.product as any).commissionValue,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/affiliate/seller-summary
// Aggregates everything the seller needs to manage their affiliate program:
// list of creators promoting their products, total commission paid, and
// performance per creator.
import mongoose from "mongoose";
import Order from "../models/orderModel";
import Product from "../models/productModel";

export const getSellerAffiliateSummary = async (req: IAuthRequest, res: Response) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }
    const sellerId = new mongoose.Types.ObjectId(req.user._id);

    // 1) Products with affiliate enabled
    const products = await Product.find({ seller: sellerId, allowCreators: true })
      .select("_id name image images price commissionType commissionValue")
      .lean();

    // 2) Creators who picked up these products
    const creatorPicks = await CreatorProduct.find({
      product: { $in: products.map((p) => p._id) },
    })
      .populate("creator", "name username email customId profileImage")
      .populate("product", "name image images price")
      .lean();

    // 3) Commission per creator from paid orders
    const commissionAgg = await Order.aggregate([
      { $match: { isPaid: true } },
      { $unwind: "$orderItems" },
      { $match: { "orderItems.seller": sellerId, "orderItems.creator": { $exists: true } } },
      {
        $group: {
          _id: "$orderItems.creator",
          totalCommission: { $sum: { $ifNull: ["$orderItems.commission", 0] } },
          totalRevenue: { $sum: { $multiply: ["$orderItems.price", "$orderItems.qty"] } },
          ordersCount: { $sum: 1 },
        },
      },
    ]);

    const byCreator = new Map<string, { totalCommission: number; totalRevenue: number; ordersCount: number }>();
    for (const row of commissionAgg as any[]) {
      byCreator.set(row._id.toString(), {
        totalCommission: row.totalCommission,
        totalRevenue: row.totalRevenue,
        ordersCount: row.ordersCount,
      });
    }

    // 4) Click counts per creator
    const clickAgg = await AffiliateClick.aggregate([
      { $match: { product: { $in: products.map((p) => p._id) } } },
      { $group: { _id: "$creator", clicks: { $sum: 1 } } },
    ]);
    const clicksByCreator = new Map<string, number>();
    for (const row of clickAgg as any[]) clicksByCreator.set(row._id.toString(), row.clicks);

    // 5) Build per-creator rows
    const creatorMap = new Map<string, any>();
    for (const cp of creatorPicks) {
      const cid = (cp.creator as any)?._id?.toString();
      if (!cid) continue;
      if (!creatorMap.has(cid)) {
        creatorMap.set(cid, {
          creator: cp.creator,
          products: [],
          totalCommission: byCreator.get(cid)?.totalCommission ?? 0,
          totalRevenue: byCreator.get(cid)?.totalRevenue ?? 0,
          ordersCount: byCreator.get(cid)?.ordersCount ?? 0,
          clicks: clicksByCreator.get(cid) ?? 0,
        });
      }
      creatorMap.get(cid).products.push({
        product: cp.product,
        affiliateCode: cp.affiliateCode,
      });
    }

    const totals = {
      activeCreators: creatorMap.size,
      activeProducts: products.length,
      totalCommissionPaid: Array.from(byCreator.values()).reduce(
        (s, c) => s + c.totalCommission,
        0,
      ),
      totalAffiliateRevenue: Array.from(byCreator.values()).reduce(
        (s, c) => s + c.totalRevenue,
        0,
      ),
      totalClicks: Array.from(clicksByCreator.values()).reduce((s, n) => s + n, 0),
    };

    res.status(200).json({
      success: true,
      data: {
        totals,
        creators: Array.from(creatorMap.values()).sort(
          (a, b) => b.totalCommission - a.totalCommission,
        ),
        products,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
