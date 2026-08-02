import { getSupabase, isSupabaseConfigured } from "./supabase";
import type { Photo, PaginatedPhotos } from "./types";

// ══════════════════════════════════════════════════════════
//  SAMPLE DATA — empty array for production
// ══════════════════════════════════════════════════════════
const SAMPLE_PHOTOS: Photo[] = [];

const PAGE_SIZE = 24;

/** Helper to return empty paginated response */
function emptyPaginated(page = 1): PaginatedPhotos {
  return {
    photos: [],
    total: 0,
    page,
    pageSize: PAGE_SIZE,
    hasMore: false,
  };
}

/** Fetch paginated, published photos from Supabase. */
export async function getPhotos(
  page = 1,
  tag?: string
): Promise<PaginatedPhotos> {
  if (!isSupabaseConfigured()) {
    return emptyPaginated(page);
  }

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = getSupabase()
    .from("photos")
    .select("*", { count: "exact" })
    .eq("published", true)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (tag) {
    query = query.contains("tags", [tag]);
  }

  const { data, count, error } = await query;

  if (error || !data) {
    if (error) console.error("Supabase photos fetch error:", error);
    return emptyPaginated(page);
  }

  const total = count ?? data.length;
  return {
    photos: data as Photo[],
    total,
    page,
    pageSize: PAGE_SIZE,
    hasMore: from + PAGE_SIZE < total,
  };
}

/** Fetch single photo by ID from Supabase. */
export async function getPhotoById(id: string): Promise<Photo | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const { data, error } = await getSupabase()
    .from("photos")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return null;
  }
  return data as Photo;
}

/** Extract unique tags from all published photos in Supabase. */
export async function getAllTags(): Promise<string[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const { data, error } = await getSupabase()
    .from("photos")
    .select("tags")
    .eq("published", true);

  if (error || !data) return [];

  const tags = new Set(data.flatMap((p) => p.tags || []));
  return Array.from(tags).sort();
}
