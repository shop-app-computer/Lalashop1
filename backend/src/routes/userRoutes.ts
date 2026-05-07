import { Router } from "express";
import {
  getProfile,
  updateProfile,
  getUserProfile,
  followUser,
  getFollowers,
  getFollowing,
} from "../controllers/userController";
import { protect } from "../middlewares/authMiddleware";

const router: Router = Router();

router.get("/profile", protect, getProfile);
router.get("/profile/:id", getUserProfile);
router.put("/profile", protect, updateProfile);
router.post("/follow/:id", protect, followUser);
router.get("/followers/:id", getFollowers);
router.get("/following/:id", getFollowing);

export default router;