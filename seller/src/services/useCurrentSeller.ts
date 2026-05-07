import { useEffect, useState } from "react";
import { sellerMe, type MeResponse } from "./authApi";

export interface CurrentSeller {
  _id: string;
  name?: string;
  username?: string;
  email?: string;
  phone?: string;
  isSeller?: boolean;
  isAdmin?: boolean;
  seller_type?: string;
  balance?: number;
  profileImage?: string;
  customId?: string;
}

interface UseCurrentSellerResult {
  seller: CurrentSeller | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useCurrentSeller(): UseCurrentSellerResult {
  const [seller, setSeller] = useState<CurrentSeller | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

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
    setLoading(true);
    sellerMe()
      .then((res: MeResponse) => {
        if (cancelled) return;
        if (res?._id) {
          setSeller(res as CurrentSeller);
        } else {
          setSeller(null);
        }
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setError(err.message);
        setSeller(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [tick]);

  return {
    seller,
    loading,
    error,
    refresh: () => setTick((t) => t + 1),
  };
}
