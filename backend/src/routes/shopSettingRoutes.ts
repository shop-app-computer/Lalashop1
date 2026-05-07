import express from "express";
import { protect } from "../middlewares/authMiddleware";
import {
  getSettings,
  updateGeneral,
  updateShipping,
  updatePayment,
  toggleIntegration,
} from "../controllers/shopSettingController";

const router = express.Router();

router.use(protect);

router.get("/", getSettings);
router.put("/general", updateGeneral);
router.put("/shipping", updateShipping);
router.put("/payment", updatePayment);
router.post("/integrations/:key/toggle", toggleIntegration);

export default router;
