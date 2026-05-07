import { useEffect, useState } from "react";
import { apiClient } from "./apiClient";

export interface CurrentUser {
  _id: string;
  name?: string;
  username?: string;
  email?: string;
  phone?: string;
  profileImage?: string;
  bio?: string;
  isAdmin?: boolean;
  isSeller?: boolean;
  customId?: string;
  followers?: any[];
  following?: any[];
  balance?: number;
}

interface UseCurrentUserResult {
  user: CurrentUser | null;
  loading: boolean;
}

export function useCurrentUser(): UseCurrentUserResult {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") {
      setLoading(false);
      return;
    }
    const token = window.localStorage.getItem("token");
    if (!token || token === "null" || token === "undefined") {
      setLoading(false);
      return;
    }
    let cancelled = false;
    apiClient("/auth/me")
      .then((res) => {
        if (cancelled) return;
        if (res?._id) setUser(res as CurrentUser);
      })
      .catch(() => {
        /* unauthenticated */
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { user, loading };
}
