import { NextRequest } from "next/server";
import { createPhotoKeys, createUploadUrl, isR2Configured, publicR2Url } from "@/lib/r2";

const MAX_ORIGINAL_BYTES = 50 * 1024 * 1024;
const allowedExtensions = new Set(["jpg", "jpeg", "png", "webp", "heic", "heif", "raf"]);

function isAdmin(request: NextRequest) {
  const value = request.headers.get("x-admin-passkey");
  const keys = [process.env.ADMIN_PASSKEY, process.env.ADMIN_SECRET_KEY].filter(Boolean);
  return Boolean(value && keys.includes(value));
}

export async function POST(request: NextRequest) {
  if (!isAdmin(request)) return Response.json({ error: "Unauthorized." }, { status: 401 });
  if (!isR2Configured()) return Response.json({ error: "Cloudflare R2 is not configured." }, { status: 503 });
  try {
    const { filename, contentType, size } = await request.json() as { filename?: string; contentType?: string; size?: number };
    const extension = filename?.split(".").pop()?.toLowerCase();
    if (!filename || !extension || !allowedExtensions.has(extension)) return Response.json({ error: "Use a JPG, PNG, WebP, HEIC, or RAF image." }, { status: 400 });
    if (!size || size > MAX_ORIGINAL_BYTES) return Response.json({ error: "Images must be smaller than 50 MB." }, { status: 400 });
    const keys = createPhotoKeys(filename);
    const originalType = contentType || "application/octet-stream";
    const [originalUploadUrl, webUploadUrl, thumbnailUploadUrl] = await Promise.all([
      createUploadUrl(keys.original, originalType), createUploadUrl(keys.web, "image/jpeg", true), createUploadUrl(keys.thumbnail, "image/jpeg", true),
    ]);
    return Response.json({ keys, uploadUrls: { original: originalUploadUrl, web: webUploadUrl, thumbnail: thumbnailUploadUrl }, publicUrls: { web: publicR2Url(keys.web), thumbnail: publicR2Url(keys.thumbnail) } });
  } catch (error) {
    console.error("R2 presign error:", error);
    return Response.json({ error: "Unable to prepare R2 upload." }, { status: 500 });
  }
}
