// Image upload helper — Cloudflare R2 backed.
//
// All Lalashop images live in R2. The flow is:
//   1. Browser asks /api/upload/presign for a short-lived PUT URL.
//   2. Browser PUTs the file directly to R2 (no proxying through our backend).
//   3. We persist the returned `publicUrl` on the resource document.
//
// Cloudflare doesn't support unsigned browser uploads, so we cannot replace the
// presign call with a static-token shortcut.

import { apiClient } from "./apiClient";

export type UploadFolder =
  | "products"
  | "profile"
  | "posts"
  | "messages"
  | "banners"
  | "kyc"
  | "uploads";

interface PresignResponse {
  success: boolean;
  data?: {
    uploadUrl: string;
    publicUrl: string;
    key: string;
    expiresIn: number;
  };
  message?: string;
}

export const uploadImage = async (
  file: File,
  folder: UploadFolder = "uploads"
): Promise<string> => {
  const presign: PresignResponse = await apiClient("/upload/presign", {
    method: "POST",
    body: JSON.stringify({
      filename: file.name,
      contentType: file.type || "application/octet-stream",
      folder,
    }),
  });
  if (!presign?.success || !presign.data) {
    throw new Error(presign?.message || "Failed to get upload URL");
  }
  const { uploadUrl, publicUrl } = presign.data;

  const putRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type || "application/octet-stream" },
    body: file,
  });
  if (!putRes.ok) {
    throw new Error(`Upload failed: HTTP ${putRes.status}`);
  }
  return publicUrl;
};

export const uploadImages = async (
  files: File[],
  folder: UploadFolder = "uploads"
): Promise<string[]> => Promise.all(files.map((f) => uploadImage(f, folder)));
