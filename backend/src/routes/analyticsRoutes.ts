import { Router } from "express";
import { protect } from "../middlewares/authMiddleware";
import { getCreatorAnalytics } from "../controllers/analyticsController";

const router: Router = Router();

router.get("/creator/me", protect, getCreatorAnalytics);

export default router;
