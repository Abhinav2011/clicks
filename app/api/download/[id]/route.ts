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

  // ── Generate signed URL for original (private bucket) ──
  if (isSupabaseConfigured() && photo.original_image_path) {
    try {
      const { getServiceClient } = await import("@/lib/supabase");
      const admin = getServiceClient();
      const { data, error } = await admin.storage
        .from("photos-original")
        .createSignedUrl(photo.original_image_path, 300); // 5 min expiry

      if (data?.signedUrl && !error) {
        return Response.redirect(data.signedUrl, 302);
      }
    } catch (err) {
      console.error("Signed URL generation failed:", err);
    }
  }

  // ── Fallback: redirect to the web-optimized image ──
  return Response.redirect(photo.web_image_url, 302);
}
