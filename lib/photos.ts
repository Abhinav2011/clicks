import { getSupabase, isSupabaseConfigured } from "./supabase";
import type { Photo, PaginatedPhotos } from "./types";

// ══════════════════════════════════════════════════════════
//  SAMPLE DATA — used when Supabase is not yet configured
// ══════════════════════════════════════════════════════════
const SAMPLE_PHOTOS: Photo[] = [
  {
    id: "1",
    title: "Golden Hour at the Coast",
    description:
      "Warm evening light painting the cliffs in gold. Shot with Classic Chrome for that muted, filmic warmth.",
    web_image_url:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&q=80",
    original_image_path: null,
    thumbnail_url:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&q=70",
    width: 1200,
    height: 800,
    camera: "Fujifilm X-T5",
    lens: "XF 23mm f/1.4 R LM WR",
    film_simulation: "Classic Chrome",
    iso: 160,
    aperture: "f/5.6",
    shutter_speed: "1/500s",
    focal_length: "23mm",
    location: "California Coast",
    tags: ["landscape", "golden hour", "coast"],
    download_count: 42,
    published: true,
    created_at: "2024-11-15T18:30:00Z",
  },
  {
    id: "2",
    title: "Neon Alley",
    description:
      "Midnight wander through rain-soaked streets. Classic Neg brings out those deep greens and muted highlights.",
    web_image_url:
      "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1200&q=80",
    original_image_path: null,
    thumbnail_url:
      "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=400&q=70",
    width: 800,
    height: 1200,
    camera: "Fujifilm X-T5",
    lens: "XF 35mm f/1.4 R",
    film_simulation: "Classic Neg.",
    iso: 1600,
    aperture: "f/1.4",
    shutter_speed: "1/60s",
    focal_length: "35mm",
    location: "Tokyo, Japan",
    tags: ["street", "night", "neon"],
    download_count: 78,
    published: true,
    created_at: "2024-10-22T23:15:00Z",
  },
  {
    id: "3",
    title: "Morning Mist",
    description:
      "Early dawn fog settling between mountain ridges. ACROS renders the tonal contrast beautifully.",
    web_image_url:
      "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&q=80",
    original_image_path: null,
    thumbnail_url:
      "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&q=70",
    width: 1200,
    height: 750,
    camera: "Fujifilm X-T5",
    lens: "XF 56mm f/1.2 R",
    film_simulation: "ACROS",
    iso: 200,
    aperture: "f/8",
    shutter_speed: "1/250s",
    focal_length: "56mm",
    location: "Blue Ridge Mountains",
    tags: ["landscape", "fog", "black and white"],
    download_count: 31,
    published: true,
    created_at: "2024-09-10T06:45:00Z",
  },
  {
    id: "4",
    title: "Market Colors",
    description:
      "Vibrant spice stalls at the weekend farmer's market. Velvia really makes those reds pop.",
    web_image_url:
      "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=1200&q=80",
    original_image_path: null,
    thumbnail_url:
      "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400&q=70",
    width: 1200,
    height: 900,
    camera: "Fujifilm X-T5",
    lens: "XF 23mm f/1.4 R LM WR",
    film_simulation: "Velvia/Vivid",
    iso: 400,
    aperture: "f/2.8",
    shutter_speed: "1/125s",
    focal_length: "23mm",
    location: "Portland, Oregon",
    tags: ["street", "colors", "market"],
    download_count: 55,
    published: true,
    created_at: "2024-08-05T10:20:00Z",
  },
  {
    id: "5",
    title: "Solitude",
    description:
      "A lone figure on the pier, lost in thought. The Provia rendition keeps things natural and true.",
    web_image_url:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1200&q=80",
    original_image_path: null,
    thumbnail_url:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=400&q=70",
    width: 1200,
    height: 800,
    camera: "Fujifilm X-T5",
    lens: "XF 56mm f/1.2 R",
    film_simulation: "Provia/Standard",
    iso: 250,
    aperture: "f/4",
    shutter_speed: "1/500s",
    focal_length: "56mm",
    location: "Santa Monica",
    tags: ["portrait", "pier", "moody"],
    download_count: 23,
    published: true,
    created_at: "2024-07-18T17:00:00Z",
  },
  {
    id: "6",
    title: "Autumn Path",
    description:
      "Fallen leaves carpeting a forest trail. Nostalgic Neg gives it that warm, vintage memory feel.",
    web_image_url:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&q=80",
    original_image_path: null,
    thumbnail_url:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=70",
    width: 800,
    height: 1100,
    camera: "Fujifilm X-T5",
    lens: "XF 18-55mm f/2.8-4 R LM OIS",
    film_simulation: "Nostalgic Neg.",
    iso: 320,
    aperture: "f/3.6",
    shutter_speed: "1/200s",
    focal_length: "35mm",
    location: "Vermont",
    tags: ["landscape", "autumn", "forest"],
    download_count: 66,
    published: true,
    created_at: "2024-10-03T14:30:00Z",
  },
  {
    id: "7",
    title: "Urban Geometry",
    description:
      "Abstract lines of modern architecture converging. PRO Neg. Hi keeps contrast tight and clinical.",
    web_image_url:
      "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=1200&q=80",
    original_image_path: null,
    thumbnail_url:
      "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=400&q=70",
    width: 1200,
    height: 800,
    camera: "Fujifilm X-T5",
    lens: "XF 16mm f/1.4 R WR",
    film_simulation: "PRO Neg. Hi",
    iso: 200,
    aperture: "f/8",
    shutter_speed: "1/1000s",
    focal_length: "16mm",
    location: "Chicago",
    tags: ["architecture", "abstract", "urban"],
    download_count: 37,
    published: true,
    created_at: "2024-06-25T12:00:00Z",
  },
  {
    id: "8",
    title: "Quiet Café",
    description:
      "Steam rising from a pour-over. Eterna's cinematic palette turns everyday moments into scenes.",
    web_image_url:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200&q=80",
    original_image_path: null,
    thumbnail_url:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=70",
    width: 1200,
    height: 900,
    camera: "Fujifilm X-T5",
    lens: "XF 35mm f/1.4 R",
    film_simulation: "Eterna",
    iso: 800,
    aperture: "f/1.4",
    shutter_speed: "1/125s",
    focal_length: "35mm",
    location: null,
    tags: ["still life", "café", "cinematic"],
    download_count: 19,
    published: true,
    created_at: "2024-12-01T09:00:00Z",
  },
  {
    id: "9",
    title: "Desert Bloom",
    description:
      "Wildflowers erupting across desert sand after the rains. REALA ACE keeps skin tones and petals true to life.",
    web_image_url:
      "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=1200&q=80",
    original_image_path: null,
    thumbnail_url:
      "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=400&q=70",
    width: 1200,
    height: 800,
    camera: "Fujifilm X-T5",
    lens: "XF 18-55mm f/2.8-4 R LM OIS",
    film_simulation: "REALA ACE",
    iso: 200,
    aperture: "f/5.6",
    shutter_speed: "1/640s",
    focal_length: "42mm",
    location: "Joshua Tree",
    tags: ["landscape", "desert", "flowers"],
    download_count: 48,
    published: true,
    created_at: "2024-04-12T15:45:00Z",
  },
  {
    id: "10",
    title: "The Waiting Room",
    description:
      "Bleached light pouring through old windows. Eterna Bleach Bypass strips the scene of saturation.",
    web_image_url:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=1200&q=80",
    original_image_path: null,
    thumbnail_url:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&q=70",
    width: 900,
    height: 1200,
    camera: "Fujifilm X-T5",
    lens: "XF 23mm f/1.4 R LM WR",
    film_simulation: "Eterna Bleach Bypass",
    iso: 640,
    aperture: "f/2",
    shutter_speed: "1/80s",
    focal_length: "23mm",
    location: null,
    tags: ["interior", "moody", "cinematic"],
    download_count: 15,
    published: true,
    created_at: "2024-03-08T11:30:00Z",
  },
  {
    id: "11",
    title: "Sunset Silhouettes",
    description:
      "Trees framing a burning sunset sky. Astia softens the transition between light and shadow.",
    web_image_url:
      "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200&q=80",
    original_image_path: null,
    thumbnail_url:
      "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&q=70",
    width: 1200,
    height: 800,
    camera: "Fujifilm X-T5",
    lens: "XF 56mm f/1.2 R",
    film_simulation: "Astia/Soft",
    iso: 200,
    aperture: "f/5.6",
    shutter_speed: "1/250s",
    focal_length: "56mm",
    location: "Sedona, Arizona",
    tags: ["landscape", "sunset", "silhouette"],
    download_count: 92,
    published: true,
    created_at: "2024-05-20T19:15:00Z",
  },
  {
    id: "12",
    title: "Rainy Window",
    description:
      "Droplets on glass, city lights bleeding through. Classic Chrome feels right for this melancholy mood.",
    web_image_url:
      "https://images.unsplash.com/photo-1501999635878-71cb5379c2d8?w=1200&q=80",
    original_image_path: null,
    thumbnail_url:
      "https://images.unsplash.com/photo-1501999635878-71cb5379c2d8?w=400&q=70",
    width: 800,
    height: 1200,
    camera: "Fujifilm X-T5",
    lens: "XF 35mm f/1.4 R",
    film_simulation: "Classic Chrome",
    iso: 3200,
    aperture: "f/1.4",
    shutter_speed: "1/30s",
    focal_length: "35mm",
    location: "New York City",
    tags: ["street", "rain", "moody"],
    download_count: 61,
    published: true,
    created_at: "2024-11-28T21:00:00Z",
  },
];

// ══════════════════════════════════════════════════════════
//  PUBLIC API
// ══════════════════════════════════════════════════════════

const PAGE_SIZE = 24;

/** Fetch paginated, published photos. Falls back to sample data. */
export async function getPhotos(
  page = 1,
  tag?: string
): Promise<PaginatedPhotos> {
  if (!isSupabaseConfigured()) {
    return paginateSample(page, tag);
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
    console.error("Supabase photos fetch error:", error);
    return paginateSample(page, tag);
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

/** Fetch single photo by ID */
export async function getPhotoById(id: string): Promise<Photo | null> {
  if (!isSupabaseConfigured()) {
    return SAMPLE_PHOTOS.find((p) => p.id === id) ?? null;
  }

  const { data, error } = await getSupabase()
    .from("photos")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data as Photo;
}

/** Extract unique tags from all published photos */
export async function getAllTags(): Promise<string[]> {
  if (!isSupabaseConfigured()) {
    const tags = new Set(SAMPLE_PHOTOS.flatMap((p) => p.tags));
    return Array.from(tags).sort();
  }

  const { data, error } = await getSupabase()
    .from("photos")
    .select("tags")
    .eq("published", true);

  if (error || !data) return [];

  const tags = new Set(
    (data as { tags: string[] }[]).flatMap((r) => r.tags)
  );
  return Array.from(tags).sort();
}

// ──── helpers ─────────────────────────────────────────────
function paginateSample(
  page: number,
  tag?: string
): PaginatedPhotos {
  const filtered = tag
    ? SAMPLE_PHOTOS.filter((p) => p.tags.includes(tag))
    : SAMPLE_PHOTOS;

  const from = (page - 1) * PAGE_SIZE;
  const photos = filtered.slice(from, from + PAGE_SIZE);

  return {
    photos,
    total: filtered.length,
    page,
    pageSize: PAGE_SIZE,
    hasMore: from + PAGE_SIZE < filtered.length,
  };
}

/** Prepend a newly uploaded photo (for sample / local mode) */
export function addSamplePhoto(photo: Photo): void {
  SAMPLE_PHOTOS.unshift(photo);
}
