import express from "express";
import { protect } from "../middlewares/authMiddleware";
import {
  listConversations,
  startConversation,
  listMessages,
  sendMessage,
  markRead,
  unreadSummary,
} from "../controllers/messageController";

const router = express.Router();

router.use(protect);

router.get("/unread-summary", unreadSummary);
router.get("/conversations", listConversations);
router.post("/conversations", startConversation);
router.get("/conversations/:id/messages", listMessages);
router.post("/conversations/:id/messages", sendMessage);
router.post("/conversations/:id/read", markRead);

export default router;
