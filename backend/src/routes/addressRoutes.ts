import express from "express";
import {
  addAddress,
  getMyAddress,
  getAllAddresses,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "../controllers/addressController";
import { protect } from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/", protect, addAddress);
router.get("/me", protect, getMyAddress);
router.get("/all", protect, getAllAddresses);
router.put("/:id", protect, updateAddress);
router.delete("/:id", protect, deleteAddress);
router.patch("/:id/default", protect, setDefaultAddress);

export default router;