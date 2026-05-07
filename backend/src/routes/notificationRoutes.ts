import { Router } from "express";
import { protect } from "../middlewares/authMiddleware";
import {
  listMyNotifications,
  markRead,
  markAllRead,
  getUnreadCount,
} from "../controllers/notificationController";

const router: Router = Router();

router.get("/", protect, listMyNotifications);
router.get("/unread-count", protect, getUnreadCount);
router.patch("/read-all", protect, markAllRead);
router.patch("/:id/read", protect, markRead);

export default router;
