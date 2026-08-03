import { NextRequest } from "next/server";
import { getPhotos } from "@/lib/photos";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || searchParams.get("limit") || "10", 10);
  const tag = searchParams.get("tag") || undefined;

  const data = await getPhotos(page, tag, pageSize);
  return Response.json(data);
}
