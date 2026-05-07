import { Router } from "express";
import { protect, optionalProtect } from "../middlewares/authMiddleware";
import {
  getRecommendedProducts,
  getMyCreatorProducts,
  addCreatorProduct,
  removeCreatorProduct,
  getByAffiliateCode,
} from "../controllers/creatorProductController";

const router: Router = Router();

router.get("/recommended", optionalProtect, getRecommendedProducts);
router.get("/me", protect, getMyCreatorProducts);
router.post("/", protect, addCreatorProduct);
router.delete("/:id", protect, removeCreatorProduct);
router.get("/by-code/:code", getByAffiliateCode);

export default router;
