import { Router } from "express";
import { protect } from "../middlewares/authMiddleware";
import { submitKyc, getMyKyc } from "../controllers/kycController";
import { uploadDocs } from "../utils/fileUpload";

const router: Router = Router();

const kycUpload = uploadDocs.fields([
  { name: "licenseFile", maxCount: 1 },
  { name: "idFile", maxCount: 1 },
  { name: "additionalDocs", maxCount: 5 },
]);

router.post("/submit", protect, kycUpload, submitKyc);
router.get("/me", protect, getMyKyc);

export default router;
