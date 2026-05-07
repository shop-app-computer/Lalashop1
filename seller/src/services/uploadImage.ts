// Cloudflare R2 image upload helper for the seller dashboard.
// See frontend/src/services/uploadImage.ts for the full architecture rationale.

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
  const presign = (await apiClient<PresignResponse>("/upload/presign", {
    method: "POST",
    body: JSON.stringify({
      filename: file.name,
      contentType: file.type || "application/octet-stream",
      folder,
    }),
  })) as PresignResponse;
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
