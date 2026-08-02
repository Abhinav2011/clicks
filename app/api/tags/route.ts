import { getAllTags } from "@/lib/photos";

export async function GET() {
  const tags = await getAllTags();
  return Response.json({ tags });
}
