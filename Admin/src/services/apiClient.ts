const PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
const API_URL = PUBLIC_API_URL?.endsWith("/api")
  ? PUBLIC_API_URL
  : `${PUBLIC_API_URL || "http://localhost:5000"}/api`;

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  meta?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
    balanceTotal?: number;
  };
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

const readToken = (): string | null => {
  if (typeof window === "undefined") return null;
  const token = window.localStorage.getItem("token");
  if (!token || token === "null" || token === "undefined") return null;
  return token;
};

export const apiClient = async <T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const token = readToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });

  let payload: ApiResponse<T> | { message?: string } | null = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const message =
      (payload && (payload as { message?: string }).message) ||
      `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status);
  }

  return (payload ?? { success: true }) as ApiResponse<T>;
};
