import React, { useState } from "react";
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, User } from "lucide-react";
import Link from "next/link";
import { apiClient } from "@/services/apiClient";
import { formatTimeAgo } from "../utils/time";

export interface BackendPost {
  _id: string;
  user: {
    _id: string;
    name?: string;
    username?: string;
    profileImage?: string;
  };
  mediaUrl: string;
  mediaType: "image" | "video";
  caption?: string;
  likes: string[];
  comments: { _id?: string; user: any; text: string; createdAt: string }[];
  createdAt: string;
}

interface SocialPostProps {
  post: BackendPost;
  currentUserId?: string;
}

export default function SocialPost({ post, currentUserId }: SocialPostProps) {
  const [likes, setLikes] = useState<string[]>(post.likes || []);
  const [isSaved, setIsSaved] = useState(false);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState(post.comments || []);
  const [submittingComment, setSubmittingComment] = useState(false);

  const isLiked = currentUserId ? likes.includes(currentUserId) : false;
  const username = post.user?.username || post.user?.name || "user";
  const avatar =
    post.user?.profileImage ||
    `https://i.pravatar.cc/150?u=${post.user?._id || username}`;
  const profileHref = `/u/${post.user?._id || ""}`;

  const toggleLike = async () => {
    if (!currentUserId) return;
    const wasLiked = isLiked;
    setLikes((prev) =>
      wasLiked ? prev.filter((id) => id !== currentUserId) : [...prev, currentUserId]
    );
    try {
      await apiClient(`/posts/${post._id}/like`, { method: "POST" });
    } catch {
      setLikes((prev) =>
        wasLiked ? [...prev, currentUserId] : prev.filter((id) => id !== currentUserId)
      );
    }
  };

  const submitComment = async () => {
    if (!commentText.trim()) return;
    setSubmittingComment(true);
    try {
      const res = await apiClient(`/posts/${post._id}/comments`, {
        method: "POST",
        body: JSON.stringify({ text: commentText.trim() }),
      });
      if (res?.data) {
        setComments((prev) => [...prev, res.data]);
        setCommentText("");
      }
    } catch (err) {
      console.error("Comment failed", err);
    } finally {
      setSubmittingComment(false);
    }
  };

  return (
    <article className="bg-white border border-gray-border rounded-lg overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between px-3 py-3">
        <Link href={profileHref} className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-border">
            <img src={avatar} alt={username} className="w-full h-full object-cover" />
          </div>
          <div>
            <h3 className="text-sm font-bold leading-none hover:text-dark/80 transition-colors text-dark">
              {username}
            </h3>
            <p className="text-[10px] text-gray-500 mt-1">{formatTimeAgo(post.createdAt)}</p>
          </div>
        </Link>
        <MoreHorizontal size={18} className="text-dark cursor-pointer" />
      </div>

      {post.caption && (
        <div className="px-3 pb-2">
          <p className="text-sm text-dark whitespace-pre-wrap leading-relaxed">
            <Link href={profileHref} className="font-bold mr-2 hover:text-dark/80 transition-colors">
              {username}
            </Link>
            {post.caption}
          </p>
        </div>
      )}

      <div className="aspect-square bg-gray-light relative group">
        {post.mediaType === "video" ? (
          <video
            src={post.mediaUrl}
            controls
            playsInline
            preload="metadata"
            className="w-full h-full object-cover bg-black"
          />
        ) : (
          <img
            src={post.mediaUrl}
            alt={post.caption || "post"}
            className="w-full h-full object-cover cursor-pointer"
            onDoubleClick={toggleLike}
          />
        )}
      </div>

      <div className="p-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <button onClick={toggleLike} className="active:scale-125 transition-transform">
              <Heart
                size={24}
                className={`transition-colors ${
                  isLiked ? "text-red-500 fill-red-500" : "text-dark hover:text-gray-500"
                }`}
              />
            </button>
            <button onClick={() => setShowCommentInput(!showCommentInput)}>
              <MessageCircle size={24} className="text-dark cursor-pointer hover:text-gray-500" />
            </button>
            <Send size={24} className="text-dark cursor-pointer hover:text-gray-500 -rotate-12" />
          </div>
          <button onClick={() => setIsSaved((s) => !s)}>
            <Bookmark
              size={24}
              className={`transition-colors ${
                isSaved ? "text-dark fill-dark" : "text-dark hover:text-gray-500"
              }`}
            />
          </button>
        </div>

        <div className="space-y-1">
          <p className="text-sm font-bold text-dark">{likes.length.toLocaleString()} likes</p>
          {comments.length > 0 && (
            <button
              className="text-sm text-gray-500"
              onClick={() => setShowCommentInput((v) => !v)}
            >
              View all {comments.length} comments
            </button>
          )}
        </div>
      </div>

      {showCommentInput && (
        <div className="border-t border-gray-border px-3 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-6 h-6 rounded-full bg-gray-light overflow-hidden flex items-center justify-center">
              <User size={14} className="text-gray-400" />
            </div>
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submitComment();
              }}
              placeholder="Add a comment..."
              className="text-sm outline-none flex-1 text-dark bg-transparent"
            />
          </div>
          <button
            onClick={submitComment}
            disabled={!commentText.trim() || submittingComment}
            className="text-primary font-semibold text-sm hover:text-primary-hover disabled:opacity-40"
          >
            Post
          </button>
        </div>
      )}
    </article>
  );
}
