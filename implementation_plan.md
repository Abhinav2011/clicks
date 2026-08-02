# Fujifilm Photo Showcase Architecture & Implementation Plan

A minimalist, comforting, artist-focused photography gallery and portfolio website tailored specifically for showcasing Fujifilm photography ("clicks"). The platform features a Pinterest-inspired responsive masonry layout, interactive photo lightboxes displaying detailed camera metadata & film recipes, direct full-resolution downloads, and an elegant contact card with an integrated email form.

---

## 1. Architectural Recommendations & Tech Stack

### 🚀 Backend Decision: Is Spring Boot Required?
**Short Answer:** **No, Spring Boot is not needed for this project.**

**Why Next.js + Supabase is the optimal choice over Spring Boot:**
1. **Simplified Infrastructure:** As a single developer / artist pet project, maintaining a separate Java Spring Boot server requires hosting (e.g., AWS EC2, Heroku, Railway) and continuous DevOps overhead.
2. **Next.js App Router Server Actions / API Routes:** Next.js handles server-side rendering, API endpoints, contact form email handling, and dynamic metadata out of the box.
3. **Supabase (Backend-as-a-Service):** Supabase provides a production-grade PostgreSQL database, Row-Level Security (RLS), instant RESTful APIs, and 1GB free storage for media—all with zero server management.

---

### 📦 Storage & Database Recommendation (Supabase)
- **Supabase Storage:** Store full-resolution `.jpg` / `.raf` / `.png` photos in a public bucket. Free tier offers 1GB storage + instant global CDN bandwidth.
- **Supabase PostgreSQL Database:**
  - `photos` table: `id`, `title`, `description`, `image_url`, `thumbnail_url`, `width`, `height`, `camera`, `lens`, `film_simulation`, `iso`, `aperture`, `shutter_speed`, `focal_length`, `location`, `tags`, `download_count`, `created_at`.
  - `contact_messages` table (optional backup): log form submissions in addition to emailing.

---

### 🎨 Design & Aesthetic Direction ("Artist's Dream")
- **Color Palette:** Warm organic paper tones (`#FAF8F5`), rich charcoal (`#1C1C1C`), subtle muted sage (`#8A9A86`), warm amber/film accents (`#D4A373`).
- **Typography:** Dual font pair featuring an elegant serif (e.g. *Cormorant Garamond* or *Playfair Display*) for headers & camera specs, coupled with a clean sans-serif (*Inter* or *Outfit*) for interface elements.
- **Pinterest-Style Layout:** Multi-column responsive masonry grid (1 col mobile, 2 col tablet, 3-4 col desktop) with stagger animation on scroll.
- **Fujifilm Heritage Touch:** Custom film simulation badges (e.g., *Classic Chrome*, *Velvia/Vivid*, *ACROS*, *Classic Neg*, *Provia*).

---

## User Review Required

> [!IMPORTANT]
> **Email Service Choice:** For the contact form, we recommend **Resend** (free 3,000 emails/mo) or **Web3Forms** (zero backend setup) to deliver contact messages directly to your inbox. Let us know if you have a preferred email service provider!

> [!NOTE]
> **Image Storage Setup:** We will include mock photos and a Supabase client setup script. Once you create a free Supabase project, you can plug in your environment variables (`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`) to immediately sync live photos!

---

## Proposed Changes

### Core Project Scaffold & Design System

#### [NEW] [package.json](file:///Users/abhinavkumar/Desktop/abhinav_clicks/clicks/package.json)
- Initialize Next.js 14+ (App Router), TypeScript, Tailwind CSS, Lucide Icons, Framer Motion, and `@supabase/supabase-js`.

#### [NEW] [tailwind.config.js](file:///Users/abhinavkumar/Desktop/abhinav_clicks/clicks/tailwind.config.js)
- Configure custom filmic color tokens, masonry column utilities, serif/sans font families, and soft glassmorphism shadows.

#### [NEW] [app/globals.css](file:///Users/abhinavkumar/Desktop/abhinav_clicks/clicks/app/globals.css)
- Add CSS custom variables, smooth scroll behavior, subtle film grain background texture, and responsive masonry styling.

---

### Components & Features

#### [NEW] [components/Header.tsx](file:///Users/abhinavkumar/Desktop/abhinav_clicks/clicks/components/Header.tsx)
- Minimalist top navigation with brand title ("FUJI CLICKS / Portfolio"), category filters (All, Street, Landscape, Portrait, Film Recipes), and quick link to Contact Card.

#### [NEW] [components/MasonryGrid.tsx](file:///Users/abhinavkumar/Desktop/abhinav_clicks/clicks/components/MasonryGrid.tsx)
- Pinterest-style staggered photo layout with lazy loading, aspect ratio preservation, hover overlays showing film recipe badges, and smooth entry animations.

#### [NEW] [components/PhotoCard.tsx](file:///Users/abhinavkumar/Desktop/abhinav_clicks/clicks/components/PhotoCard.tsx)
- Individual card item with hover micro-interactions, full-res quick download button, and lightbox click trigger.

#### [NEW] [components/PhotoModal.tsx](file:///Users/abhinavkumar/Desktop/abhinav_clicks/clicks/components/PhotoModal.tsx)
- High-res lightbox viewer featuring split layout:
  - Left: Full photo with zoom capability.
  - Right: EXIF data panel (Fujifilm Camera, Lens, Shutter speed, Aperture, ISO, Film Recipe badge), description, share link, and high-res download button.

#### [NEW] [components/ContactCard.tsx](file:///Users/abhinavkumar/Desktop/abhinav_clicks/clicks/components/ContactCard.tsx)
- Premium "Artist Profile & Contact Card" featuring:
  - Avatar / photographer bio.
  - "In My Camera Bag" gear section (e.g., Fujifilm X-T5, XF 35mm f/1.4, XF 18-55mm).
  - Integrated luxury contact form (Name, Email, Message, Subject) sending emails directly via Next.js API route.

#### [NEW] [app/api/contact/route.ts](file:///Users/abhinavkumar/Desktop/abhinav_clicks/clicks/app/api/contact/route.ts)
- API endpoint for receiving contact messages, validating inputs, and routing to email service (Resend / SMTP).

#### [NEW] [lib/photos.ts](file:///Users/abhinavkumar/Desktop/abhinav_clicks/clicks/lib/photos.ts) & [lib/supabase.ts](file:///Users/abhinavkumar/Desktop/abhinav_clicks/clicks/lib/supabase.ts)
- Data fetchers supporting both Supabase storage/database AND rich sample local Fujifilm photo data (so the app works out-of-the-box before Supabase credentials are input).

---

## Verification Plan

### Automated Verification
- Verify build integrity with `npm run build` or `npx next build`.
- Validate TypeScript compilation without errors.

### Manual & Visual Verification
- **Pinterest Masonry Test:** Verify layout dynamically rearranges across Mobile (<640px), Tablet (640px–1024px), and Desktop (>1024px) without breaking.
- **Lightbox EXIF Modal:** Verify photo popup opens smoothly, displays camera metadata, film recipe tag, and triggers full-res image download.
- **Contact Form Validation:** Verify form input validation, loading state, and success toast feedback.
- **Cross-Platform Responsiveness:** Test responsive UI in browser viewports.
