import { Request, Response } from "express";
import mongoose from "mongoose";
import Product from "../models/productModel";

interface ProductListQuery {
  page?: string;
  limit?: string;
  search?: string;
  status?: string;
  category?: string;
  flag?: string;
}

const parsePagination = (query: ProductListQuery) => {
  const page = Math.max(parseInt(query.page || "1", 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit || "50", 10) || 50, 1), 200);
  return { page, limit, skip: (page - 1) * limit };
};

const buildFilter = (query: ProductListQuery): Record<string, unknown> => {
  const filter: Record<string, unknown> = {};

  if (query.status === "pending") filter.status = "Draft";
  else if (query.status === "active") filter.status = "Active";
  else if (query.status === "archived") filter.status = "Archived";

  if (query.flag === "banned") filter.tags = { $in: ["banned"] };
  else if (query.flag === "featured") filter.tags = { $in: ["featured"] };
  else if (query.flag === "violations") filter.tags = { $in: ["violation", "reported"] };

  if (query.category) filter.category = query.category;

  if (query.search) {
    const safe = query.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(safe, "i");
    filter.$or = [{ name: re }, { description: re }, { sku: re }, { vendor: re }];
  }

  return filter;
};

export const adminListProducts = async (req: Request, res: Response) => {
  try {
    const { page, limit, skip } = parsePagination(req.query as ProductListQuery);
    const filter = buildFilter(req.query as ProductListQuery);

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("seller", "name email customId")
        .lean(),
      Product.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: products,
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const adminGetProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid product id" });
    }
    const product = await Product.findById(id)
      .populate("seller", "name email customId profileImage")
      .lean();
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.status(200).json({ success: true, data: product });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const adminUpdateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid product id" });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const { status, action, badge } = req.body as {
      status?: "Active" | "Draft" | "Archived";
      action?: "approve" | "ban" | "feature" | "unfeature" | "unban" | "flag-violation" | "clear-violation";
      badge?: string;
    };

    if (status && ["Active", "Draft", "Archived"].includes(status)) {
      product.status = status;
    }

    const tagSet = new Set<string>(product.tags || []);
    switch (action) {
      case "approve":
        product.status = "Active";
        tagSet.delete("pending-review");
        break;
      case "ban":
        product.status = "Archived";
        tagSet.add("banned");
        break;
      case "unban":
        tagSet.delete("banned");
        break;
      case "feature":
        tagSet.add("featured");
        break;
      case "unfeature":
        tagSet.delete("featured");
        break;
      case "flag-violation":
        tagSet.add("violation");
        break;
      case "clear-violation":
        tagSet.delete("violation");
        tagSet.delete("reported");
        break;
    }
    product.tags = Array.from(tagSet);

    if (typeof badge === "string") product.badge = badge;

    await product.save();

    res.status(200).json({
      success: true,
      data: {
        _id: product._id,
        status: product.status,
        tags: product.tags,
        badge: product.badge,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const adminProductStats = async (_req: Request, res: Response) => {
  try {
    const [total, active, draft, banned, featured, violations] = await Promise.all([
      Product.countDocuments({}),
      Product.countDocuments({ status: "Active" }),
      Product.countDocuments({ status: "Draft" }),
      Product.countDocuments({ tags: "banned" }),
      Product.countDocuments({ tags: "featured" }),
      Product.countDocuments({ tags: { $in: ["violation", "reported"] } }),
    ]);

    res.status(200).json({
      success: true,
      data: { total, active, pending: draft, banned, featured, violations },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
