import { useState, useCallback, useEffect } from "react";
import { apiClient } from "@/services/apiClient";

export interface SocialState {
  isLiked: boolean;
  likesCount: number;
  isFollowing: boolean;
  isSaved: boolean;
}

export function useSocialActions(initialState: Partial<SocialState> = {}, userId?: string) {
  const [state, setState] = useState<SocialState>({
    isLiked: initialState.isLiked || false,
    likesCount: initialState.likesCount || 0,
    isFollowing: initialState.isFollowing || false,
    isSaved: initialState.isSaved || false,
  });

  const toggleLike = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isLiked: !prev.isLiked,
      likesCount: prev.isLiked ? prev.likesCount - 1 : prev.likesCount + 1,
    }));
  }, []);

  const toggleFollow = useCallback(async () => {
    if (!userId) return;

    // Optimistic UI update
    setState((prev) => ({
      ...prev,
      isFollowing: !prev.isFollowing,
    }));

    try {
      const data = await apiClient(`/users/follow/${userId}`, {
        method: "POST",
      });

      // Sync with actual server state if needed
      setState((prev) => ({
        ...prev,
        isFollowing: data.isFollowing,
      }));

      // Dispatch event for profile update
      window.dispatchEvent(new CustomEvent('followStatusChanged', { 
          detail: { userId, isFollowing: data.isFollowing } 
      }));
    } catch (error: any) {
      // Revert on error
      setState((prev) => ({
        ...prev,
        isFollowing: !prev.isFollowing,
      }));
      console.error("Follow error:", error);
    }
  }, [userId]);

  const toggleSave = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isSaved: !prev.isSaved,
    }));
  }, []);

  return {
    ...state,
    toggleLike,
    toggleFollow,
    toggleSave,
  };
}