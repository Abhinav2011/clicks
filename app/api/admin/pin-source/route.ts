import { NextRequest } from "next/server";
import { getPhotoById } from "@/lib/photos";

export const dynamic = "force-dynamic";

function isAdmin(request: NextRequest) {
  const value = request.headers.get("x-admin-passkey");
  const keys = [process.env.ADMIN_PASSKEY, process.env.ADMIN_SECRET_KEY].filter(Boolean);
  return Boolean(value && keys.includes(value));
}

export async function POST(request: NextRequest) {
  if (!isAdmin(request)) return Response.json({ error: "Unauthorized." }, { status: 401 });
  try {
    const { id } = await request.json() as { id?: string };
    if (!id) return Response.json({ error: "Photo ID is required." }, { status: 400 });

    const photo = await getPhotoById(id);
    const source = photo?.web_image_url || photo?.thumbnail_url;
    if (!source) return Response.json({ error: "Photo not found." }, { status: 404 });

    const upstream = await fetch(source, { cache: "no-store" });
    if (!upstream.ok || !upstream.body) throw new Error(`Image upstream returned ${upstream.status}`);
    return new Response(upstream.body, {
      headers: {
        "Content-Type": upstream.headers.get("content-type") || "image/jpeg",
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("Pinterest Pin image proxy error:", error);
    return Response.json({ error: "Could not load the photo." }, { status: 502 });
  }
}
