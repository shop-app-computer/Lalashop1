const PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
const API_URL = PUBLIC_API_URL?.endsWith("/api")
  ? PUBLIC_API_URL
  : `${PUBLIC_API_URL || ""}/api`;

interface ApiClientOptions extends RequestInit {
  body?: BodyInit | null;
}

export const apiClient = async <T = unknown>(
  endpoint: string,
  options: ApiClientOptions = {}
): Promise<T> => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem("token");
    if (token && token !== "null" && token !== "undefined") {
      (headers as Record<string, string>).Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const message =
      (payload && typeof payload === "object" && "message" in payload
        ? String((payload as { message?: string }).message)
        : null) || `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return (payload ?? {}) as T;
};
