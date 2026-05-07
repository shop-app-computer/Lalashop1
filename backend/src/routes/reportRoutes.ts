import { Router } from "express";
import { protect } from "../middlewares/authMiddleware";
import { createReport } from "../controllers/reportController";

const router: Router = Router();

router.post("/", protect, createReport);

export default router;
