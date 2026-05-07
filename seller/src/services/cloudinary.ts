// Cloudinary unsigned upload helper.
// All Lalashop images are stored on Cloudinary — never persist to backend uploads.
// Configure NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME + NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
// in seller/.env.local for this to work.

interface CloudinaryUploadResponse {
  secure_url?: string;
  error?: { message?: string };
}

export const uploadToCloudinary = async (file: File): Promise<string> => {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  if (!cloudName || !uploadPreset) {
    throw new Error(
      "Cloudinary is not configured. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET."
    );
  }
  const data = new FormData();
  data.append("file", file);
  data.append("upload_preset", uploadPreset);
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: data }
  );
  const json: CloudinaryUploadResponse = await res.json();
  if (!res.ok || !json.secure_url) {
    throw new Error(json?.error?.message || "Image upload failed");
  }
  return json.secure_url;
};

export const uploadManyToCloudinary = async (files: File[]): Promise<string[]> => {
  return Promise.all(files.map((f) => uploadToCloudinary(f)));
};
