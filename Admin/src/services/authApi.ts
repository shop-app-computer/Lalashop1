const PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
const API_URL = PUBLIC_API_URL?.endsWith("/api")
  ? PUBLIC_API_URL
  : `${PUBLIC_API_URL || "http://localhost:5000"}/api`;

export interface LoginResponse {
  success: boolean;
  _id?: string;
  name?: string;
  username?: string;
  email?: string;
  phone?: string;
  isAdmin?: boolean;
  isSeller?: boolean;
  profileImage?: string;
  bio?: string;
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
  isAdmin?: boolean;
  isSeller?: boolean;
  seller_type?: string;
  balance?: number;
  profileImage?: string;
  bio?: string;
  customId?: string;
  followers?: string[];
  following?: string[];
  message?: string;
}

const authedHeaders = (): HeadersInit => {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem("token");
    if (token && token !== "null" && token !== "undefined") {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }
  return headers;
};

export const adminLogin = async (email: string, password: string): Promise<LoginResponse> => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = (await res.json()) as LoginResponse;
  if (!res.ok) {
    throw new Error(data.message || `Login failed (${res.status})`);
  }
  return data;
};

export const adminMe = async (): Promise<MeResponse> => {
  const res = await fetch(`${API_URL}/auth/me`, {
    headers: authedHeaders(),
  });
  const data = (await res.json()) as MeResponse;
  if (!res.ok) {
    throw new Error(data.message || `getMe failed (${res.status})`);
  }
  return data;
};

export const adminForgotPassword = async (email: string): Promise<{ success: boolean; message?: string }> => {
  const res = await fetch(`${API_URL}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const data = (await res.json()) as { success: boolean; message?: string };
  if (!res.ok) {
    throw new Error(data.message || `Request failed (${res.status})`);
  }
  return data;
};

export const adminVerifyEmailOTP = async (code: string): Promise<{ success: boolean; message?: string; token?: string }> => {
  const res = await fetch(`${API_URL}/auth/2fa/email/verify`, {
    method: "POST",
    headers: authedHeaders(),
    body: JSON.stringify({ otp: code }),
  });
  const data = (await res.json()) as { success: boolean; message?: string; token?: string };
  if (!res.ok) {
    throw new Error(data.message || `OTP verification failed (${res.status})`);
  }
  return data;
};

export const adminSendEmailOTP = async (): Promise<{ success: boolean; message?: string }> => {
  const res = await fetch(`${API_URL}/auth/2fa/email/send`, {
    method: "POST",
    headers: authedHeaders(),
  });
  const data = (await res.json()) as { success: boolean; message?: string };
  if (!res.ok) {
    throw new Error(data.message || `Failed to send OTP (${res.status})`);
  }
  return data;
};

export const adminVerifyTOTP = async (code: string): Promise<{ success: boolean; message?: string }> => {
  const res = await fetch(`${API_URL}/auth/2fa/verify`, {
    method: "POST",
    headers: authedHeaders(),
    body: JSON.stringify({ token: code }),
  });
  const data = (await res.json()) as { success: boolean; message?: string };
  if (!res.ok) {
    throw new Error(data.message || `TOTP verification failed (${res.status})`);
  }
  return data;
};
