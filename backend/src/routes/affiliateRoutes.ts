import { Router } from "express";
import { optionalProtect, protect } from "../middlewares/authMiddleware";
import {
  attributeProduct,
  getSellerAffiliateSummary,
} from "../controllers/affiliateController";

const router: Router = Router();

router.post("/attribute", optionalProtect, attributeProduct);
router.get("/seller-summary", protect, getSellerAffiliateSummary);

export default router;
