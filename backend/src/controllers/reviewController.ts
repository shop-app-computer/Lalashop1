import { Request, Response } from "express";
import Review from "../models/reviewModel";
import Product from "../models/productModel";
import { IAuthRequest } from "../middlewares/authMiddleware";

const recalcProductRating = async (productId: string) => {
  const stats = await Review.aggregate([
    { $match: { product: new (require("mongoose").Types.ObjectId)(productId) } },
    {
      $group: {
        _id: "$product",
        avg: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);
  const avg = stats[0]?.avg || 0;
  const count = stats[0]?.count || 0;
  await Product.findByIdAndUpdate(productId, {
    rating: Math.round(avg * 10) / 10,
    numReviews: count,
  });
};

// @desc    Get reviews for a product
// @route   GET /api/products/:id/reviews
// @access  Public
export const getProductReviews = async (req: Request, res: Response) => {
  try {
    const reviews = await Review.find({ product: req.params.id })
      .populate("user", "name username profileImage")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: reviews });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Server Error" });
  }
};

// @desc    Create a review for a product
// @route   POST /api/products/:id/reviews
// @access  Private
export const createProductReview = async (req: IAuthRequest, res: Response) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const { rating, comment, target } = req.body || {};
    const numericRating = Number(rating);
    if (!numericRating || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    if (product.seller.toString() === req.user._id.toString()) {
      return res
        .status(400)
        .json({ success: false, message: "Sellers cannot review their own product" });
    }

    const review = await Review.create({
      product: product._id,
      seller: product.seller,
      user: req.user._id,
      rating: numericRating,
      comment: typeof comment === "string" ? comment : "",
      target: target === "shop" ? "shop" : "product",
    });

    await recalcProductRating(product._id.toString());

    const populated = await Review.findById(review._id).populate(
      "user",
      "name username profileImage"
    );

    res.status(201).json({ success: true, data: populated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Server Error" });
  }
};
