import React from "react";
import { useSocialActions } from "../hooks/useSocialActions";

interface FollowButtonProps {
  initialFollowing?: boolean;
  userId?: string;
  className?: string;
}

export default function FollowButton({ initialFollowing = false, userId, className = "" }: FollowButtonProps) {
  const { isFollowing, toggleFollow } = useSocialActions({ isFollowing: initialFollowing }, userId);

  return (
    <button 
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFollow();
      }}
      className={`text-sm font-semibold py-1.5 px-4 rounded-lg transition-all active:scale-95 ${
        isFollowing 
          ? "bg-gray-100 text-slate-800 hover:bg-gray-200" 
          : "bg-primary text-white hover:bg-primary-hover shadow-sm"
      } ${className}`}
    >
      {isFollowing ? "Following" : "Follow"}
    </button>
  );
}