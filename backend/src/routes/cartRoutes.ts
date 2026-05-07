import express from "express";
import { getCart, addToCart, removeFromCart, clearCart } from "../controllers/cartController";
import { optionalProtect } from "../middlewares/authMiddleware";

const router = express.Router();

router.use(optionalProtect);

router.get("/", getCart);
router.post("/items", addToCart);
router.delete("/items", removeFromCart);
router.delete("/", clearCart);

export default router;
