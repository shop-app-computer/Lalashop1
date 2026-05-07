import { apiClient } from "./apiClient";

export interface LoginResponse {
  success: boolean;
  _id?: string;
  name?: string;
  username?: string;
  email?: string;
  phone?: string;
  isAdmin?: boolean;
  isSeller?: boolean;
  seller_type?: string;
  profileImage?: string;
  customId?: string;
  token?: string;
  message?: string;
}

export interface MeResponse {
  success: boolean;
  _id?: string;
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
  message?: string;
}

export const sellerLogin = (email: string, password: string): Promise<LoginResponse> =>
  apiClient<LoginResponse>("/auth/seller-login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

export const sellerMe = (): Promise<MeResponse> =>
  apiClient<MeResponse>("/auth/me");

export const sellerLogout = (): void => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem("token");
  window.localStorage.removeItem("seller");
};
