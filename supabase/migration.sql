-- ══════════════════════════════════════════════════════════
-- Supabase SQL Migration — Clicks Photo Gallery
-- Run this in the Supabase SQL Editor after creating your project
-- ══════════════════════════════════════════════════════════

-- ─── Photos table ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.photos (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title        TEXT NOT NULL,
  description  TEXT,
  web_image_url     TEXT NOT NULL,          -- public bucket path
  original_image_path TEXT,                 -- private bucket path (nullable)
  thumbnail_url     TEXT NOT NULL,
  width        INTEGER NOT NULL DEFAULT 1200,
  height       INTEGER NOT NULL DEFAULT 800,
  camera       TEXT,
  lens         TEXT,
  film_simulation TEXT,
  iso          INTEGER,
  aperture     TEXT,
  shutter_speed TEXT,
  focal_length TEXT,
  location     TEXT,                        -- manually curated, never GPS auto-populated
  tags         TEXT[] DEFAULT '{}',
  download_count INTEGER DEFAULT 0,
  published    BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Contact messages table ────────────────────────────────
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  subject    TEXT NOT NULL,
  message    TEXT NOT NULL,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════

-- Enable RLS on both tables
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- ─── Photos: public can only SELECT published photos ───────
CREATE POLICY "Public can view published photos"
  ON public.photos
  FOR SELECT
  USING (published = true);

-- ─── Photos: only authenticated admin can modify ───────────
CREATE POLICY "Admin can manage all photos"
  ON public.photos
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ─── Contact messages: INSERT only (via service-role from API route) ──
CREATE POLICY "Service role can insert contact messages"
  ON public.contact_messages
  FOR INSERT
  WITH CHECK (true);

-- No public SELECT on contact_messages (admin reads via dashboard)

-- ═══════════════════════════════════════════════════════════
-- FUNCTIONS
-- ═══════════════════════════════════════════════════════════

-- Increment download count atomically
CREATE OR REPLACE FUNCTION public.increment_download_count(photo_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.photos
  SET download_count = download_count + 1
  WHERE id = photo_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════
-- STORAGE BUCKETS (run these if they don't exist)
-- ═══════════════════════════════════════════════════════════

-- Public bucket for web-optimized images
INSERT INTO storage.buckets (id, name, public)
VALUES ('photos-web', 'photos-web', true)
ON CONFLICT (id) DO NOTHING;

-- Private bucket for full-resolution originals
INSERT INTO storage.buckets (id, name, public)
VALUES ('photos-original', 'photos-original', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: anyone can read from public bucket
CREATE POLICY "Public read access for photos-web"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'photos-web');

-- Storage policy: only authenticated users can upload
CREATE POLICY "Admin upload to photos-web"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'photos-web' AND auth.role() = 'authenticated');

CREATE POLICY "Admin upload to photos-original"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'photos-original' AND auth.role() = 'authenticated');
