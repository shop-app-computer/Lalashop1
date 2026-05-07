import express from "express";
import { protect } from "../middlewares/authMiddleware";
import {
  listRefunds,
  decideRefund,
  listSettlements,
  listTransactions,
} from "../controllers/financeController";

const router = express.Router();

router.use(protect);

router.get("/refunds", listRefunds);
router.put("/refunds/:id", decideRefund);
router.get("/settlements", listSettlements);
router.get("/transactions", listTransactions);

export default router;
