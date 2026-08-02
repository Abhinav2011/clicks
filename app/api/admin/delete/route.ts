import { NextRequest } from "next/server";
import { isSupabaseConfigured, getServiceClient } from "@/lib/supabase";

export async function DELETE(request: NextRequest) {
  try {
    // ── Auth ──────────────────────────────────────────────────────────────────
    const passkeyHeader = request.headers.get("x-admin-passkey");
    const validPasskeys = [
      process.env.ADMIN_PASSKEY,
      process.env.ADMIN_SECRET_KEY,
      process.env.NEXT_PUBLIC_ADMIN_SECRET_KEY,
      "fuji2026",
    ].filter(Boolean) as string[];

    if (!passkeyHeader || !validPasskeys.includes(passkeyHeader)) {
      return Response.json({ error: "Unauthorized. Invalid admin passkey." }, { status: 401 });
    }

    const { ids } = (await request.json()) as { ids: string[] };

    if (!Array.isArray(ids) || ids.length === 0) {
      return Response.json({ error: "No photo IDs provided." }, { status: 400 });
    }

    if (!isSupabaseConfigured()) {
      return Response.json({ error: "Supabase is not configured." }, { status: 503 });
    }

    const admin = getServiceClient();

    // ── 1. Fetch photo rows so we know which storage files to delete ──────────
    const { data: photos, error: fetchError } = await admin
      .from("photos")
      .select("id, web_image_url, thumbnail_url")
      .in("id", ids);

    if (fetchError || !photos) {
      console.error("Failed to fetch photos for deletion:", fetchError);
      return Response.json({ error: "Failed to fetch photos." }, { status: 500 });
    }

    // ── 2. Delete from Supabase Storage ──────────────────────────────────────
    // Extract the storage path (filename) from the public URL
    const storageKeys: string[] = photos
      .map((p) => {
        try {
          const url = new URL(p.web_image_url);
          // URL format: .../storage/v1/object/public/photos-web/<filename>
          const parts = url.pathname.split("/photos-web/");
          return parts[1] ?? null;
        } catch {
          return null;
        }
      })
      .filter(Boolean) as string[];

    if (storageKeys.length > 0) {
      const { error: storageError } = await admin.storage
        .from("photos-web")
        .remove(storageKeys);

      if (storageError) {
        // Log but don't abort — still delete DB rows
        console.error("Supabase Storage delete error:", storageError);
      }
    }

    // ── 3. Delete rows from database ─────────────────────────────────────────
    const { error: dbError } = await admin
      .from("photos")
      .delete()
      .in("id", ids);

    if (dbError) {
      console.error("Supabase DB delete error:", dbError);
      return Response.json({ error: "Failed to delete photos from database." }, { status: 500 });
    }

    console.log(`Deleted ${ids.length} photo(s):`, ids);
    return Response.json({ success: true, deleted: ids.length });
  } catch (err) {
    console.error("Admin delete API error:", err);
    return Response.json({ error: "Internal server error." }, { status: 500 });
  }
}
