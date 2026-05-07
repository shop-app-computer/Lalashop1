// Cloudflare R2 service.
//
// R2 is S3-compatible, so we use the AWS SDK v3 with R2's endpoint. The
// browser uploads directly to R2 via short-lived presigned PUT URLs that this
// service mints — no file ever flows through our backend. The backend only
// holds the API token (server-side) and tells the client where to PUT.
//
// Required env vars (set in backend/.env):
//   R2_ACCOUNT_ID         — Cloudflare account ID
//   R2_ACCESS_KEY_ID      — R2 API token Access Key ID
//   R2_SECRET_ACCESS_KEY  — R2 API token Secret
//   R2_BUCKET             — bucket name
//   R2_PUBLIC_BASE_URL    — public delivery base (custom domain or *.r2.dev)

import crypto from "crypto";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const accountId = process.env.R2_ACCOUNT_ID || "";
const accessKeyId = process.env.R2_ACCESS_KEY_ID || "";
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || "";
const bucket = process.env.R2_BUCKET || "";
const publicBaseUrl = (process.env.R2_PUBLIC_BASE_URL || "").replace(/\/$/, "");

export const isR2Configured = (): boolean =>
  Boolean(accountId && accessKeyId && secretAccessKey && bucket && publicBaseUrl);

let client: S3Client | null = null;
const getClient = (): S3Client => {
  if (!isR2Configured()) {
    throw new Error("R2 is not configured — set R2_* env vars in backend/.env");
  }
  if (!client) {
    client = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey },
    });
  }
  return client;
};

const safeExt = (filename: string): string => {
  const m = filename.match(/\.([a-zA-Z0-9]{1,8})$/);
  return m ? m[1].toLowerCase() : "bin";
};

const slugify = (s: string): string =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

// Build a key like `products/2026/05/abc123-foo.jpg`. The leading folder lets
// us scope future bucket policies / lifecycle rules per resource type.
export interface ObjectKeyOptions {
  folder?: string;
  filename?: string;
  ext?: string;
}

export const buildObjectKey = (opts: ObjectKeyOptions = {}): string => {
  const folder = (opts.folder || "uploads").replace(/^\/+|\/+$/g, "");
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const random = crypto.randomBytes(8).toString("hex");
  const slug = opts.filename ? slugify(opts.filename) : "file";
  const ext = opts.ext || (opts.filename ? safeExt(opts.filename) : "bin");
  return `${folder}/${yyyy}/${mm}/${random}-${slug}.${ext}`;
};

export interface PresignResult {
  uploadUrl: string;
  publicUrl: string;
  key: string;
  expiresIn: number;
}

// Mint a presigned PUT URL valid for ~5 minutes. The browser uploads with the
// returned `uploadUrl` (Content-Type must match) and stores the resulting
// `publicUrl` on the resource document.
export const presignUpload = async (params: {
  filename: string;
  contentType: string;
  folder?: string;
}): Promise<PresignResult> => {
  const c = getClient();
  const key = buildObjectKey({ folder: params.folder, filename: params.filename });
  const cmd = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: params.contentType,
  });
  const expiresIn = 300; // 5 minutes
  const uploadUrl = await getSignedUrl(c, cmd, { expiresIn });
  return {
    uploadUrl,
    publicUrl: `${publicBaseUrl}/${key}`,
    key,
    expiresIn,
  };
};

// Server-side direct upload — used by the migration script to import existing
// Cloudinary images straight into R2 without needing a browser round-trip.
export const putObject = async (params: {
  key: string;
  body: Buffer;
  contentType: string;
}): Promise<string> => {
  const c = getClient();
  await c.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: params.key,
      Body: params.body,
      ContentType: params.contentType,
    })
  );
  return `${publicBaseUrl}/${params.key}`;
};
