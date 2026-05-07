import express from "express";
import { protect } from "../middlewares/authMiddleware";
import {
  listCustomers,
  upsertLabel,
  getCustomerActivity,
  getSegmentSummary,
} from "../controllers/customerController";

const router = express.Router();

router.use(protect);

router.get("/", listCustomers);
router.get("/segments", getSegmentSummary);
router.get("/:id/activity", getCustomerActivity);
router.put("/:id/label", upsertLabel);

export default router;
