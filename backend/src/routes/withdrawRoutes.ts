import { Router } from "express";
import { protect } from "../middlewares/authMiddleware";
import {
  listMyWithdrawals,
  createWithdrawal,
  cancelWithdrawal,
  getWithdrawRules,
} from "../controllers/withdrawController";

const router: Router = Router();

router.get("/rules", getWithdrawRules);
router.get("/me", protect, listMyWithdrawals);
router.post("/create", protect, createWithdrawal);
router.put("/:id/cancel", protect, cancelWithdrawal);

export default router;
