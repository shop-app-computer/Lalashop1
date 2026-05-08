import { Router } from "express";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getMySellerOrders,
  getMyCreatorOrders,
  payOrder,
  deliverOrder,
  deleteOrder,
  updateMyOrderStatus,
} from "../controllers/orderController";
import { protect, optionalProtect } from "../middlewares/authMiddleware";

const router: Router = Router();

router.post("/", optionalProtect, createOrder);
router.get("/mine", optionalProtect, getMyOrders);
router.get("/seller", protect, getMySellerOrders);
router.get("/creator", protect, getMyCreatorOrders);
router.get("/:id", getOrderById);
router.put("/:id/pay", optionalProtect, payOrder);
router.put("/:id/deliver", protect, deliverOrder);
router.patch("/:id/seller-status", protect, updateMyOrderStatus);
router.delete("/:id", optionalProtect, deleteOrder);

export default router;
