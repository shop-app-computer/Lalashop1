const PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
const API_URL = PUBLIC_API_URL?.endsWith("/api")
  ? PUBLIC_API_URL
  : `${PUBLIC_API_URL || "http://localhost:5000"}/api`;

export const apiClient = async (endpoint: string, options: RequestInit = {}) => {
  // ดึง Token จาก localStorage (ถ้ามี)
  let token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
  
  // ป้องกันการส่ง string "undefined" หรือ "null" ไปที่ Backend
  if (token === "undefined" || token === "null" || !token) {
    token = null;
  }
  
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "เกิดข้อผิดพลาดในการเชื่อมต่อ");
    }

    return data;
  } catch (error: any) {
    console.error("API Fetch Error:", error.message);
    throw error;
  }
};