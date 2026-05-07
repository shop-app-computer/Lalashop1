import { Router } from "express";
import { optionalProtect } from "../middlewares/authMiddleware";
import { attributeProduct } from "../controllers/affiliateController";

const router: Router = Router();

router.post("/attribute", optionalProtect, attributeProduct);

export default router;
