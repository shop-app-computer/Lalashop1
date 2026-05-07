import express from "express";
import { protect } from "../middlewares/authMiddleware";
import {
  listCoupons,
  getCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  listPromotions,
  getPromotion,
  createPromotion,
  updatePromotion,
  deletePromotion,
  listBroadcasts,
  createBroadcast,
  sendBroadcast,
  deleteBroadcast,
} from "../controllers/marketingController";

const router = express.Router();

router.use(protect);

router.get("/coupons", listCoupons);
router.post("/coupons", createCoupon);
router.get("/coupons/:id", getCoupon);
router.put("/coupons/:id", updateCoupon);
router.delete("/coupons/:id", deleteCoupon);

router.get("/promotions", listPromotions);
router.post("/promotions", createPromotion);
router.get("/promotions/:id", getPromotion);
router.put("/promotions/:id", updatePromotion);
router.delete("/promotions/:id", deletePromotion);

router.get("/broadcasts", listBroadcasts);
router.post("/broadcasts", createBroadcast);
router.post("/broadcasts/:id/send", sendBroadcast);
router.delete("/broadcasts/:id", deleteBroadcast);

export default router;
