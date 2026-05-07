import { Response } from "express";
import { isR2Configured, presignUpload } from "../services/r2Service";
import { IAuthRequest } from "../middlewares/authMiddleware";

const ALLOWED_FOLDERS = new Set([
  "products",
  "profile",
  "posts",
  "messages",
  "banners",
  "kyc",
  "uploads",
]);

const ALLOWED_MIME_PREFIXES = ["image/", "video/"];
const MAX_FILENAME_LEN = 200;

// POST /api/upload/presign
// Body: { filename: string, contentType: string, folder?: string }
// Auth: required (so anonymous traffic can't burn R2 PUT operations).
export const getPresignedUploadUrl = async (req: IAuthRequest, res: Response) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }
    if (!isR2Configured()) {
      return res
        .status(500)
        .json({ success: false, message: "R2 is not configured on the server" });
    }

    const filename = String(req.body?.filename || "").slice(0, MAX_FILENAME_LEN);
    const contentType = String(req.body?.contentType || "");
    const folderRaw = String(req.body?.folder || "uploads");

    if (!filename || !contentType) {
      return res
        .status(400)
        .json({ success: false, message: "filename and contentType are required" });
    }
    if (!ALLOWED_MIME_PREFIXES.some((p) => contentType.startsWith(p))) {
      return res.status(400).json({
        success: false,
        message: "Only image or video uploads are allowed",
      });
    }
    const folder = ALLOWED_FOLDERS.has(folderRaw) ? folderRaw : "uploads";

    const result = await presignUpload({ filename, contentType, folder });
    return res.json({ success: true, data: result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server Error";
    return res.status(500).json({ success: false, message });
  }
};
