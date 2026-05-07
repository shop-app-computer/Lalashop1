import express from "express";
import { addBank, getMyBank } from "../controllers/bankController";
import { protect } from "../middlewares/authMiddleware"; 

const router = express.Router();

// ใช้ protect แทน authMiddleware
router.post("/add", protect, addBank);
router.get("/me", protect, getMyBank);

export default router;