import { NextRequest } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase";
import type { Photo, FilmSimulation } from "@/lib/types";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    // ── Check Admin Passkey Security ──
    const passkeyHeader = request.headers.get("x-admin-passkey");
    const validPasskeys = [
      process.env.ADMIN_PASSKEY,
      process.env.ADMIN_SECRET_KEY,
      process.env.NEXT_PUBLIC_ADMIN_SECRET_KEY,
    ].filter(Boolean) as string[];

    if (!passkeyHeader || validPasskeys.length === 0 || !validPasskeys.includes(passkeyHeader)) {
      return Response.json(
        { error: "Unauthorized. Invalid admin passkey." },
        { status: 401 }
      );
    }

    let title = "Untitled Photo";
    let description: string | null = null;
    let camera = "Fujifilm X-T5";
    let lens: string | null = null;
    let film_simulation: FilmSimulation | null = null;
    let iso: number | null = null;
    let aperture: string | null = null;
    let shutter_speed: string | null = null;
    let focal_length: string | null = null;
    let location: string | null = null;
    let tags: string[] = [];
    let web_image_url = "";
    let thumbnail_url = "";
    let original_image_path: string | null = null;
    let fileBuffer: Buffer | null = null;
    let fileExt = ".jpg";
    let imageWidth = 3840;
    let imageHeight = 2560;

    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const json = await request.json();
      title = json.title || "Untitled Photo";
      description = json.description || null;
      camera = json.camera || "Fujifilm X-T5";
      lens = json.lens || null;
      film_simulation = json.film_simulation || null;
      iso = json.iso ? Number(json.iso) : null;
      aperture = json.aperture || null;
      shutter_speed = json.shutter_speed || null;
      focal_length = json.focal_length || null;
      location = json.location || null;
      tags = Array.isArray(json.tags) ? json.tags : [];
      web_image_url = json.web_image_url || "";
      thumbnail_url = json.thumbnail_url || "";
      original_image_path = json.original_image_path || null;
      if (json.width) imageWidth = Number(json.width);
      if (json.height) imageHeight = Number(json.height);
    } else {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return Response.json({ error: "No image file uploaded." }, { status: 400 });
      }
      title = (formData.get("title") as string) || "Untitled Photo";
      description = (formData.get("description") as string) || null;
      camera = (formData.get("camera") as string) || "Fujifilm X-T5";
      lens = (formData.get("lens") as string) || null;
      film_simulation = (formData.get("film_simulation") as FilmSimulation) || null;
      const isoStr = formData.get("iso") as string;
      iso = isoStr ? parseInt(isoStr, 10) : null;
      aperture = (formData.get("aperture") as string) || null;
      shutter_speed = (formData.get("shutter_speed") as string) || null;
      focal_length = (formData.get("focal_length") as string) || null;
      location = (formData.get("location") as string) || null;
      const tagsRaw = (formData.get("tags") as string) || "";
      tags = tagsRaw ? tagsRaw.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean) : [];

      fileBuffer = Buffer.from(await file.arrayBuffer());
      fileExt = path.extname(file.name) || ".jpg";

      try {
        const exifr = await import("exifr");
        const dim = await exifr.parse(fileBuffer, ["ExifImageWidth", "ExifImageHeight", "ImageWidth", "ImageHeight"]);
        if (dim) {
          const w = dim.ExifImageWidth || dim.ImageWidth;
          const h = dim.ExifImageHeight || dim.ImageHeight;
          if (w && h) {
            imageWidth = Number(w);
            imageHeight = Number(h);
          }
        }
      } catch (e) {
        console.log("Could not extract image dimensions:", e);
      }
    }

    if (!isSupabaseConfigured()) {
      return Response.json({ error: "Supabase database is not configured." }, { status: 503 });
    }

    const { getServiceClient } = await import("@/lib/supabase");
    const admin = getServiceClient();

    // If fileBuffer was passed directly (legacy upload), upload to Supabase Storage first
    if (fileBuffer && !web_image_url) {
      const uniqueFilename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${fileExt}`;
      const { data: uploadData, error: uploadError } = await admin.storage
        .from("photos-web")
        .upload(uniqueFilename, fileBuffer, {
          contentType: "image/jpeg",
          upsert: true,
        });

      if (uploadError) {
        console.error("Supabase Storage upload error:", uploadError);
        return Response.json({ error: "Failed to upload image to storage." }, { status: 500 });
      }

      const { data: urlData } = admin.storage.from("photos-web").getPublicUrl(uploadData.path);
      web_image_url = urlData.publicUrl;
      thumbnail_url = urlData.publicUrl;
    }

    if (!web_image_url) {
      return Response.json({ error: "No image URL provided or generated." }, { status: 400 });
    }

    // Insert row into Supabase PostgreSQL database
    const { data: dbData, error: dbError } = await admin
      .from("photos")
      .insert({
        title,
        description,
        web_image_url,
        thumbnail_url,
        original_image_path,
        width: imageWidth,
        height: imageHeight,
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
  } catch (err) {
    console.error("Admin upload API error:", err);
    return Response.json({ error: "Internal server error during upload." }, { status: 500 });
  }
}
