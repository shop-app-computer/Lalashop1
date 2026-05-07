import express from "express";
import { protect } from "../middlewares/authMiddleware";
import { getPresignedUploadUrl } from "../controllers/uploadController";

const router = express.Router();

router.post("/presign", protect, getPresignedUploadUrl);

export default router;
