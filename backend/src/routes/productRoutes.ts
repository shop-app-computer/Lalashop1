import express from "express";
import {
  getProducts,
  getProductById,
  getMyProducts,
  getProductsBySeller,
  getProductAdverts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController";
import {
  getProductReviews,
  createProductReview,
  getMySellerReviews,
} from "../controllers/reviewController";
import { protect } from "../middlewares/authMiddleware";
import { upload } from "../utils/fileUpload";

const router = express.Router();

// List all products
router.get("/", getProducts);

// Adverts (banner images sourced from active products)
router.get("/adverts", getProductAdverts);

// Current seller's products
router.get("/my", protect, getMyProducts);

// Reviews across all of seller's products
router.get("/my/reviews", protect, getMySellerReviews);

// Products of a specific seller (View Shop)
router.get("/seller/:sellerId", getProductsBySeller);

// Create product — accepts JSON (Cloudinary URLs in body.images) or
// multipart with up to 8 image fields named "images".
router.post("/", protect, upload.array("images", 8), createProduct);

// Update product
router.put("/:id", protect, updateProduct);

// Reviews
router.get("/:id/reviews", getProductReviews);
router.post("/:id/reviews", protect, createProductReview);

// Single product
router.get("/:id", getProductById);

// Delete
router.delete("/:id", protect, deleteProduct);

export default router;
