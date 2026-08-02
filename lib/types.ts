// ─── Photo ────────────────────────────────────────────────
export interface Photo {
  id: string;
  title: string;
  description: string | null;
  web_image_url: string;       // public CDN path (web-optimized)
  original_image_path: string | null; // private bucket ref for full-res download
  thumbnail_url: string;
  width: number;
  height: number;
  camera: string | null;
  lens: string | null;
  film_simulation: FilmSimulation | null;
  iso: number | null;
  aperture: string | null;
  shutter_speed: string | null;
  focal_length: string | null;
  location: string | null;
  tags: string[];
  download_count: number;
  published: boolean;
  created_at: string;
}

// ─── Film Simulations ─────────────────────────────────────
export type FilmSimulation =
  | "Classic Chrome"
  | "Velvia/Vivid"
  | "ACROS"
  | "Classic Neg."
  | "Provia/Standard"
  | "PRO Neg. Hi"
  | "PRO Neg. Std"
  | "Astia/Soft"
  | "Eterna"
  | "Eterna Bleach Bypass"
  | "REALA ACE"
  | "Nostalgic Neg.";

// Color map for film simulation badges
export const FILM_SIM_COLORS: Record<FilmSimulation, string> = {
  "Classic Chrome":       "#8B7D6B",
  "Velvia/Vivid":         "#C13F21",
  "ACROS":                "#2C2C2C",
  "Classic Neg.":         "#6B8E6B",
  "Provia/Standard":      "#3A6EA5",
  "PRO Neg. Hi":          "#5C4033",
  "PRO Neg. Std":         "#7A6855",
  "Astia/Soft":           "#9B7CB8",
  "Eterna":               "#3D6B5E",
  "Eterna Bleach Bypass": "#A09580",
  "REALA ACE":            "#D4A373",
  "Nostalgic Neg.":       "#B87333",
};

// ─── Contact Form ─────────────────────────────────────────
export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  honeypot?: string; // must be empty — bots fill this
}

export interface ContactMessage extends ContactFormData {
  id: string;
  created_at: string;
  ip_address: string | null;
}

// ─── Paginated Response ───────────────────────────────────
export interface PaginatedPhotos {
  photos: Photo[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
