import { NextRequest } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase";
import { addSamplePhoto } from "@/lib/photos";
import type { Photo, FilmSimulation } from "@/lib/types";
import path from "path";
import fs from "fs/promises";

export async function POST(request: NextRequest) {
  try {
    // ── Check Admin Passkey Security ──
    const passkeyHeader = request.headers.get("x-admin-passkey");
    const validPasskey = process.env.ADMIN_PASSKEY || "fuji2026";

    if (!passkeyHeader || passkeyHeader !== validPasskey) {
      return Response.json(
        { error: "Unauthorized. Invalid admin passkey." },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return Response.json({ error: "No image file uploaded." }, { status: 400 });
    }

    const title = (formData.get("title") as string) || "Untitled Photo";
    const description = (formData.get("description") as string) || null;
    const camera = (formData.get("camera") as string) || "Fujifilm X-T5";
    const lens = (formData.get("lens") as string) || null;
    const film_simulation = (formData.get("film_simulation") as FilmSimulation) || null;
    const isoStr = formData.get("iso") as string;
    const iso = isoStr ? parseInt(isoStr, 10) : null;
    const aperture = (formData.get("aperture") as string) || null;
    const shutter_speed = (formData.get("shutter_speed") as string) || null;
    const focal_length = (formData.get("focal_length") as string) || null;
    const location = (formData.get("location") as string) || null;
    const tagsRaw = (formData.get("tags") as string) || "";
    const tags = tagsRaw
      ? tagsRaw
          .split(",")
          .map((t) => t.trim().toLowerCase())
          .filter(Boolean)
      : [];

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const fileExt = path.extname(file.name) || ".jpg";
    const uniqueFilename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${fileExt}`;

    let web_image_url = "";
    let thumbnail_url = "";

    // ── Mode A: Supabase Upload ──
    if (isSupabaseConfigured()) {
      const { getServiceClient } = await import("@/lib/supabase");
      const admin = getServiceClient();

      // Upload to public photos-web bucket
      const { data: uploadData, error: uploadError } = await admin.storage
        .from("photos-web")
        .upload(uniqueFilename, fileBuffer, {
          contentType: file.type || "image/jpeg",
          upsert: true,
        });

      if (uploadError) {
        console.error("Supabase Storage upload error:", uploadError);
        return Response.json({ error: "Failed to upload image to storage." }, { status: 500 });
      }

      // Get public URL
      const { data: urlData } = admin.storage
        .from("photos-web")
        .getPublicUrl(uploadData.path);

      web_image_url = urlData.publicUrl;
      thumbnail_url = urlData.publicUrl;

      // Insert row into PostgreSQL database
      const { data: dbData, error: dbError } = await admin
        .from("photos")
        .insert({
          title,
          description,
          web_image_url,
          thumbnail_url,
          width: 1200,
          height: 800,
          camera,
          lens,
          film_simulation,
          iso,
          aperture,
          shutter_speed,
          focal_length,
          location,
          tags,
          published: true,
        })
        .select()
        .single();

      if (dbError) {
        console.error("Supabase DB insert error:", dbError);
        return Response.json({ error: "Failed to save photo metadata to database." }, { status: 500 });
      }

      return Response.json({ success: true, photo: dbData as Photo });
    }

    // ── Mode B: Local Disk Fallback (No Supabase) ──
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });
    const localFilePath = path.join(uploadsDir, uniqueFilename);
    await fs.writeFile(localFilePath, fileBuffer);

    web_image_url = `/uploads/${uniqueFilename}`;
    thumbnail_url = `/uploads/${uniqueFilename}`;

    const newPhoto: Photo = {
      id: `local-${Date.now()}`,
      title,
      description,
      web_image_url,
      original_image_path: null,
      thumbnail_url,
      width: 1200,
      height: 800,
      camera,
      lens,
      film_simulation,
      iso,
      aperture,
      shutter_speed,
      focal_length,
      location,
      tags,
      download_count: 0,
      published: true,
      created_at: new Date().toISOString(),
    };

    addSamplePhoto(newPhoto);

    return Response.json({ success: true, photo: newPhoto });
  } catch (err) {
    console.error("Admin upload API error:", err);
    return Response.json({ error: "Internal server error during upload." }, { status: 500 });
  }
}
