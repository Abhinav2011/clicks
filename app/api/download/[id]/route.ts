import { NextRequest } from "next/server";
import { getPhotoById } from "@/lib/photos";
import { isSupabaseConfigured } from "@/lib/supabase";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const photo = await getPhotoById(id);
  if (!photo) {
    return Response.json({ error: "Photo not found" }, { status: 404 });
  }

  // ── Increment download count ──
  if (isSupabaseConfigured()) {
    try {
      const { getServiceClient } = await import("@/lib/supabase");
      const admin = getServiceClient();
      await admin.rpc("increment_download_count", { photo_id: id });
    } catch (err) {
      console.error("Failed to increment download count:", err);
    }
  }

  // ── 1. If R2 original master is present, redirect to R2 signed download URL ──
  if (photo.original_image_path) {
    try {
      const { isR2Configured, createDownloadUrl } = await import("@/lib/r2");
      if (isR2Configured()) {
        const ext = photo.original_image_path.split(".").pop() || "jpg";
        const safeTitle = (photo.title || "stillframe").replace(/[^a-zA-Z0-9 _-]/g, "").trim();
        const filename = `${safeTitle || "photograph"}.${ext}`;
        const downloadUrl = await createDownloadUrl(photo.original_image_path, filename);
        return Response.redirect(downloadUrl, 302);
      }
    } catch (r2Err) {
      console.error("R2 signed download URL error:", r2Err);
    }
  }

  // ── 2. Download raw file directly from storage URL (fallback) ──
  try {
    const imageUrl = photo.web_image_url;
    const res = await fetch(imageUrl);
    if (!res.ok) throw new Error("Failed to fetch full resolution image");

    const arrayBuffer = await res.arrayBuffer();
    const contentType = res.headers.get("content-type") || "image/jpeg";
    const extension = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg";
    const safeTitle = (photo.title || "stillframe").replace(/[^a-zA-Z0-9 _-]/g, "").trim();
    const filename = `${safeTitle || "photograph"}.${extension}`;

    return new Response(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(arrayBuffer.byteLength),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err) {
    console.error("Download stream error:", err);
    // Fallback: direct redirect
    return Response.redirect(photo.web_image_url, 302);
  }
}
