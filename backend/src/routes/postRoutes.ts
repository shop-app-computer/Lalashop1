import express from "express";
import {
  createPost,
  getMyPosts,
  deletePost,
  getPostById,
  updatePost,
  likePost,
  addComment,
  getComments,
  updateComment,
  deleteComment,
  getFeed,
  getPostsByUser,
} from "../controllers/postController";
import { protect } from "../middlewares/authMiddleware";

const router = express.Router();

router.get("/", getFeed);
router.post("/", protect as any, createPost);
router.get("/my", protect as any, getMyPosts);
router.get("/user/:userId", getPostsByUser);
router.get("/:id", getPostById);
router.put("/:id", protect as any, updatePost);
router.delete("/:id", protect as any, deletePost);

// Interactions
router.post("/:id/like", protect as any, likePost);
router.post("/:id/comments", protect as any, addComment);
router.get("/:id/comments", getComments);
router.put("/:id/comments/:commentId", protect as any, updateComment);
router.delete("/:id/comments/:commentId", protect as any, deleteComment);

export default router;
