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

// POST stays optionalProtect so guest checkout still works — the order data
// is returned in the response, so the buyer can show the receipt immediately
// after placing it. Everything else requires auth: the previous mix of
// optionalProtect on /mine, /:id/pay, /:id and DELETE let an unauthenticated
// caller list, pay, view, or delete any "guest" order (all shared the
// hardcoded sessionId "guest-session").
router.post("/", optionalProtect, createOrder);
router.get("/mine", protect, getMyOrders);
router.get("/seller", protect, getMySellerOrders);
router.get("/creator", protect, getMyCreatorOrders);
router.get("/:id", protect, getOrderById);
router.put("/:id/pay", protect, payOrder);
router.put("/:id/deliver", protect, deliverOrder);
router.patch("/:id/seller-status", protect, updateMyOrderStatus);
router.delete("/:id", protect, deleteOrder);

export default router;
