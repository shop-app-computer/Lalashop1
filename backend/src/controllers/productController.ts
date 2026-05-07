import { Request, Response } from "express";
import path from "path";
import Product from "../models/productModel";
import Address from "../models/addressModel";
import Order from "../models/orderModel";
import { IAuthRequest } from "../middlewares/authMiddleware";

const fileToUrl = (file?: Express.Multer.File): string => {
  if (!file) return "";
  return `/uploads/${path.basename(file.path)}`;
};

const safeJsonParse = <T,>(value: unknown, fallback: T): T => {
  if (typeof value !== "string" || value.trim() === "") return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

// @desc    Get all products
// @route   GET /api/products
// @access  Public
export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: products });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "seller",
      "name username profileImage bio followers following isSeller"
    );
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Resolve "Ships From" from the seller's default address (privacy: only province + district)
    let shipsFrom: { province: string; district: string } | null = null;
    try {
      const sellerId = (product.seller as any)?._id || product.seller;
      if (sellerId) {
        const sellerAddress =
          (await Address.findOne({ user: sellerId, isDefault: true })) ||
          (await Address.findOne({ user: sellerId }));
        if (sellerAddress) {
          shipsFrom = {
            province: sellerAddress.province || "",
            district: sellerAddress.district || "",
          };
        }
      }
    } catch {
      shipsFrom = null;
    }

    // Compute sold count from paid orders (count units, not orders)
    let soldCount = product.soldCount || 0;
    try {
      const sold = await Order.aggregate([
        { $match: { isPaid: true } },
        { $unwind: "$orderItems" },
        { $match: { "orderItems.product": product._id } },
        { $group: { _id: null, total: { $sum: "$orderItems.qty" } } },
      ]);
      soldCount = sold[0]?.total || soldCount;
    } catch {
      // keep stored soldCount
    }

    const data = {
      ...product.toObject(),
      shipsFrom,
      soldCount,
    };

    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

// @desc    Get seller products
// @route   GET /api/products/my
// @access  Private/Seller
export const getMyProducts = async (req: IAuthRequest, res: Response) => {
  try {
    const products = await Product.find({ seller: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: products });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

// @desc    Get products by seller id (public — for View Shop)
// @route   GET /api/products/seller/:sellerId
// @access  Public
export const getProductsBySeller = async (req: Request, res: Response) => {
  try {
    const products = await Product.find({
      seller: req.params.sellerId,
      status: { $ne: "Archived" },
    }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: products });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

// @desc    Get advert images across active products (for Home page banners)
// @route   GET /api/products/adverts
// @access  Public
export const getProductAdverts = async (_req: Request, res: Response) => {
  try {
    const products = await Product.find({
      status: "Active",
      advertImages: { $exists: true, $not: { $size: 0 } },
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .select("name advertImages seller");

    const adverts = products.flatMap((p: any) =>
      (p.advertImages || []).map((url: string) => ({
        productId: p._id,
        name: p.name,
        image: url,
      }))
    );

    res.status(200).json({ success: true, data: adverts });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

const toBool = (v: unknown, fallback = false): boolean => {
  if (typeof v === "boolean") return v;
  if (typeof v === "string") return v === "true";
  return fallback;
};

const buildProductPayload = (
  raw: Record<string, any>,
  uploadedFileUrls: string[] = []
): Record<string, any> => {
  const isMultipartLike = uploadedFileUrls.length > 0 || typeof raw.tags === "string";

  const parseMaybe = <T,>(value: unknown, fallback: T): T => {
    if (value === undefined || value === null) return fallback;
    if (typeof value === "string") return safeJsonParse<T>(value, fallback);
    return value as T;
  };

  const body: Record<string, any> = {
    name: raw.name,
    description: raw.description ?? "",
    price: raw.price !== undefined ? Number(raw.price) : undefined,
    compareAt: raw.compareAt !== undefined && raw.compareAt !== ""
      ? Number(raw.compareAt)
      : undefined,
    cost: raw.cost !== undefined && raw.cost !== "" ? Number(raw.cost) : undefined,
    category: raw.category,
    countInStock: Number(raw.countInStock ?? raw.stock ?? 0),
    moq: raw.moq !== undefined && raw.moq !== "" ? Number(raw.moq) : 1,
    sku: raw.sku || "",
    barcode: raw.barcode || "",
    trackInventory: toBool(raw.trackInventory, true),
    allowOversell: toBool(raw.allowOversell, false),
    reorderAt: raw.reorderAt !== undefined && raw.reorderAt !== ""
      ? Number(raw.reorderAt)
      : 0,
    status: raw.status || "Draft",
    tags: parseMaybe<string[]>(raw.tags, []),
    vendor: raw.vendor || "",
    variantOptions: parseMaybe<Array<{ name: string; values: string[] }>>(
      raw.variantOptions,
      []
    ),
    attributes: parseMaybe<Record<string, unknown>>(raw.attributes, {}),
    tiers: parseMaybe<
      Array<{ minQty: number; price: number; discountPercent?: number }>
    >(raw.tiers, []),
    weight: raw.weight !== undefined && raw.weight !== "" ? Number(raw.weight) : undefined,
    weightUnit: raw.weightUnit || "g",
    dimensions: parseMaybe<Record<string, unknown>>(raw.dimensions, {}),
    originCountry: raw.originCountry || "",
    seoTitle: raw.seoTitle || "",
    seoDescription: raw.seoDescription || "",
    slug: raw.slug || "",
    channels: parseMaybe<Record<string, boolean>>(raw.channels, {}),
    allowCreators: toBool(raw.allowCreators, false),
    commissionType: raw.commissionType || "percent",
    commissionValue: raw.commissionValue !== undefined && raw.commissionValue !== ""
      ? Number(raw.commissionValue)
      : 0,
    minCreatorTier: raw.minCreatorTier || "all",
    cookieDays: raw.cookieDays !== undefined && raw.cookieDays !== ""
      ? Number(raw.cookieDays)
      : 30,
    location: raw.location || "Thailand",
    freeShipping: toBool(raw.freeShipping, false),
    specifications: parseMaybe<Array<{ label: string; value: string }>>(
      raw.specifications,
      []
    ),
    advertImages: parseMaybe<string[]>(raw.advertImages, []),
    leadTime: parseMaybe<{ min: number; max: number; unit: string }>(
      raw.leadTime,
      undefined as any
    ),
    returnPolicy: parseMaybe<{ accepts: boolean; days: number; notes: string }>(
      raw.returnPolicy,
      undefined as any
    ),
  };

  // Images may arrive as JSON-string array, real array, or via uploaded files
  const fallbackImages = parseMaybe<string[]>(raw.images, []);
  const finalImages = uploadedFileUrls.length ? uploadedFileUrls : fallbackImages;
  if (finalImages.length) {
    body.images = finalImages;
    body.image = finalImages[0];
  }

  // Strip undefined keys so they don't overwrite existing values on update
  Object.keys(body).forEach((k) => body[k] === undefined && delete body[k]);

  return body;
};

// @desc    Create product
// @route   POST /api/products
// @access  Private/Seller
export const createProduct = async (req: IAuthRequest, res: Response) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }
    if (!req.user.isSeller) {
      return res.status(403).json({
        success: false,
        message: "Only approved sellers can create products.",
      });
    }

    const uploadedFiles = (req.files as Express.Multer.File[]) || [];
    const uploadedImageUrls = uploadedFiles
      .filter((f) => f.fieldname === "images")
      .map(fileToUrl);

    const body = buildProductPayload(req.body || {}, uploadedImageUrls);

    if (!body.name || !body.category) {
      return res.status(400).json({
        success: false,
        message: "name and category are required",
      });
    }
    if (typeof body.price !== "number" || Number.isNaN(body.price)) {
      return res.status(400).json({ success: false, message: "price must be a number" });
    }
    if (!body.images?.length) {
      return res.status(400).json({
        success: false,
        message: "At least one product image is required",
      });
    }

    const product = await Product.create({
      ...body,
      seller: req.user._id,
    });

    res.status(201).json({ success: true, data: product });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Seller (owner)
export const updateProduct = async (req: IAuthRequest, res: Response) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    if (product.seller.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized to edit this product" });
    }

    const body = buildProductPayload(req.body || {}, []);

    // Don't let an empty payload wipe required fields
    if (body.price !== undefined && (typeof body.price !== "number" || Number.isNaN(body.price))) {
      return res.status(400).json({ success: false, message: "price must be a number" });
    }

    Object.assign(product, body);
    await product.save();

    res.status(200).json({ success: true, data: product });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Seller
export const deleteProduct = async (req: IAuthRequest, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    if (product.seller.toString() !== req.user._id.toString()) {
      return res
        .status(401)
        .json({ success: false, message: "Not authorized to delete this product" });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Product removed" });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};
