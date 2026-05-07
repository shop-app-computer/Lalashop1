import { Request, Response } from "express";
import crypto from "crypto";
import mongoose from "mongoose";
import CreatorProduct from "../models/creatorProductModel";
import Product from "../models/productModel";
import { IAuthRequest } from "../middlewares/authMiddleware";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const generateAffiliateCode = (length = 8): string => {
  const bytes = crypto.randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) {
    out += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return out;
};

// GET /api/creator-products/recommended
// Products that allowCreators=true and are Active, excluding ones the creator already added.
export const getRecommendedProducts = async (req: IAuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const mineRows = userId
      ? await CreatorProduct.find({ creator: userId }).select("product").lean()
      : [];
    const excludedIds = mineRows.map((r) => r.product);

    const products = await Product.find({
      allowCreators: true,
      status: "Active",
      _id: { $nin: excludedIds },
    })
      .sort({ createdAt: -1 })
      .limit(60)
      .lean();

    res.status(200).json({ success: true, data: products });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/creator-products/me
// All products the current creator has added.
export const getMyCreatorProducts = async (req: IAuthRequest, res: Response) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }
    const rows = await CreatorProduct.find({ creator: req.user._id })
      .populate(
        "product",
        "name price compareAt image images category status countInStock allowCreators commissionType commissionValue cookieDays soldCount"
      )
      .sort({ addedAt: -1 })
      .lean();

    const data = rows.filter((r) => r.product);
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/creator-products
// Body: { productId }
export const addCreatorProduct = async (req: IAuthRequest, res: Response) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ success: false, message: "productId is required" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    if (!product.allowCreators) {
      return res
        .status(403)
        .json({ success: false, message: "This product is not open to creators" });
    }

    const existing = await CreatorProduct.findOne({
      creator: req.user._id,
      product: productId,
    });
    if (existing) {
      return res.status(200).json({ success: true, data: existing, message: "Already added" });
    }

    let code = generateAffiliateCode();
    for (let attempt = 0; attempt < 5; attempt++) {
      const dupe = await CreatorProduct.findOne({ affiliateCode: code }).lean();
      if (!dupe) break;
      code = generateAffiliateCode();
    }

    const created = await CreatorProduct.create({
      creator: req.user._id,
      product: productId,
      affiliateCode: code,
    });

    res.status(201).json({ success: true, data: created });
  } catch (error: any) {
    if (error?.code === 11000) {
      return res.status(409).json({ success: false, message: "Already added" });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/creator-products/:id
export const removeCreatorProduct = async (req: IAuthRequest, res: Response) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }
    const row = await CreatorProduct.findOneAndDelete({
      _id: req.params.id,
      creator: req.user._id,
    });
    if (!row) {
      return res.status(404).json({ success: false, message: "Not found" });
    }
    res.status(200).json({ success: true, message: "Removed" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/creator-products/by-code/:code  (public — used by tracker before redirect)
export const getByAffiliateCode = async (req: Request, res: Response) => {
  try {
    const row = await CreatorProduct.findOne({
      affiliateCode: req.params.code,
    })
      .populate("product", "_id name image")
      .populate("creator", "_id name username")
      .lean();
    if (!row) {
      return res.status(404).json({ success: false, message: "Invalid affiliate code" });
    }
    res.status(200).json({ success: true, data: row });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
