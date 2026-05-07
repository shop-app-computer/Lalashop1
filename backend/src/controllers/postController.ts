import { Response } from "express";
import { IAuthRequest } from "../middlewares/authMiddleware";
import Post from "../models/postModel";

// @desc    Create new post
// @route   POST /api/posts
// @access  Private
export const createPost = async (req: IAuthRequest, res: Response) => {
  try {
    const { 
      mediaUrl, 
      mediaType, 
      caption, 
      mentions,
      visibility,
      visibleTo,
      hiddenFrom
    } = req.body;
    
    if (!mediaUrl || !mediaType) {
      return res.status(400).json({ success: false, message: "Media URL and type are required" });
    }

    const post = await Post.create({
      user: req.user._id,
      mediaUrl,
      mediaType,
      caption,
      mentions: Array.isArray(mentions) ? mentions : [],
      visibility: visibility || "public",
      visibleTo: Array.isArray(visibleTo) ? visibleTo.filter(id => id) : [],
      hiddenFrom: Array.isArray(hiddenFrom) ? hiddenFrom.filter(id => id) : [],
    });

    res.status(201).json({ success: true, data: post });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's posts
// @route   GET /api/posts/my
// @access  Private
export const getMyPosts = async (req: IAuthRequest, res: Response) => {
  try {
    const posts = await Post.find({ user: req.user._id })
      .populate("user", "name username profileImage")
      .sort("-createdAt");
    res.status(200).json({ success: true, data: posts });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Public feed of posts (visibility=public).
//          Supports optional ?user=:id to fetch a specific user's public posts.
// @route   GET /api/posts
// @access  Public
export const getFeed = async (req: any, res: Response) => {
  try {
    const limit = Math.min(50, Number(req.query.limit) || 30);
    const filter: any = { visibility: "public" };
    if (req.query.user) filter.user = req.query.user;

    const posts = await Post.find(filter)
      .populate("user", "name username profileImage")
      .sort("-createdAt")
      .limit(limit);

    res.status(200).json({ success: true, data: posts });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Public posts by user id (for profile page)
// @route   GET /api/posts/user/:userId
// @access  Public
export const getPostsByUser = async (req: any, res: Response) => {
  try {
    const posts = await Post.find({
      user: req.params.userId,
      visibility: "public",
    })
      .populate("user", "name username profileImage")
      .sort("-createdAt");
    res.status(200).json({ success: true, data: posts });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get post by ID
// @route   GET /api/posts/:id
// @access  Public
export const getPostById = async (req: any, res: Response) => {
  try {
    const post = await Post.findById(req.params.id).populate("user", "name username profileImage");
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }
    res.status(200).json({ success: true, data: post });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private
export const updatePost = async (req: IAuthRequest, res: Response) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: "Not authorized to update this post" });
    }

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      { caption: req.body.caption },
      { new: true }
    ).populate("user", "name username profileImage");

    res.status(200).json({ success: true, data: updatedPost });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Like/Unlike post
// @route   POST /api/posts/:id/like
// @access  Private
export const likePost = async (req: IAuthRequest, res: Response) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    const isLiked = post.likes.includes(req.user._id);

    if (isLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== req.user._id.toString());
    } else {
      post.likes.push(req.user._id);
    }

    await post.save();
    res.status(200).json({ success: true, isLiked: !isLiked, userId: req.user._id });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add comment to post
// @route   POST /api/posts/:id/comments
// @access  Private
export const addComment = async (req: IAuthRequest, res: Response) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    const comment = {
      user: req.user._id,
      text: req.body.text,
      createdAt: new Date(),
    };

    post.comments.push(comment as any);
    await post.save();

    const populatedPost = await Post.findById(req.params.id)
      .populate("comments.user", "name username profileImage");
    
    const newComment = populatedPost?.comments[populatedPost.comments.length - 1];

    res.status(201).json({ success: true, data: newComment });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get post comments
// @route   GET /api/posts/:id/comments
// @access  Public
export const getComments = async (req: any, res: Response) => {
  try {
    const post = await Post.findById(req.params.id).populate("comments.user", "name username profileImage");
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }
    res.status(200).json({ success: true, data: post.comments });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update post comment
// @route   PUT /api/posts/:id/comments/:commentId
// @access  Private
export const updateComment = async (req: IAuthRequest, res: Response) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    const comment = post.comments.find((c: any) => c._id.toString() === req.params.commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: "Not authorized to update this comment" });
    }

    comment.text = req.body.text;
    await post.save();

    res.status(200).json({ success: true, data: comment });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete post comment
// @route   DELETE /api/posts/:id/comments/:commentId
// @access  Private
export const deleteComment = async (req: IAuthRequest, res: Response) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    const commentIndex = post.comments.findIndex((c: any) => c._id.toString() === req.params.commentId);
    if (commentIndex === -1) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    if (post.comments[commentIndex].user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: "Not authorized to delete this comment" });
    }

    post.comments.splice(commentIndex, 1);
    await post.save();

    res.status(200).json({ success: true, message: "Comment deleted" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private
export const deletePost = async (req: IAuthRequest, res: Response) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: "Not authorized to delete this post" });
    }

    await Post.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Post removed" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
