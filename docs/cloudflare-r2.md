# Cloudflare R2 photo storage

This app keeps Supabase only for `photos` metadata and uses R2 for the image files.

## Storage layout

Each new upload creates three objects:

| Object | Purpose | Access |
| --- | --- | --- |
| `originals/YYYY/MM/<uuid>.<source extension>` | Untouched source file | Private; download uses a 10-minute signed URL |
| `web/YYYY/MM/<uuid>.jpg` | Gallery / lightbox image, max 2560px, JPEG quality 92 | Public through the R2 custom domain |
| `thumbs/YYYY/MM/<uuid>.jpg` | Masonry-grid thumbnail, max 960px, JPEG quality 86 | Public through the R2 custom domain |

The browser creates the two JPEG derivatives before uploading. This keeps the 15 MB original out of the app server, avoids resize-hosting charges, and retains the original file byte-for-byte in R2.

## One-time R2 setup

1. Create two Standard R2 buckets: `clicks-originals` for private masters and `clicks-gallery` for public web/thumbnail JPEGs. A custom domain exposes the complete bucket, so do **not** attach one to the originals bucket.
2. Attach a custom domain to `clicks-gallery`, e.g. `images.example.com`, and set `R2_PUBLIC_URL` to it. A custom domain is preferred over `r2.dev` for a persistent production gallery.
3. Create an R2 API token scoped to both buckets with Object Read & Write permissions. Add the resulting account ID, access key ID, and secret to `.env.local` using [`.env.example`](../.env.example).
4. Add this CORS policy in **R2 → each bucket → Settings → CORS policy**. Replace the origins with your local and deployed site URLs:

```json
[
  {
    "AllowedOrigins": ["http://localhost:3000", "https://your-site.example.com"],
    "AllowedMethods": ["PUT"],
    "AllowedHeaders": ["content-type", "cache-control"],
    "ExposeHeaders": ["etag"],
    "MaxAgeSeconds": 3600
  }
]
```

5. Copy `.env.example` to `.env.local`, fill in the values, and add the same variables to your deployment provider. The R2 access key and secret must never be public browser variables.

## Operating the archive

- Upload JPEG, PNG, or WebP through `/admin`. The originals are kept unchanged and a 2560px display JPEG is created at 92 quality—far higher quality than a 300 KB image.
- A download uses the original object, not the display JPEG. It is redirected to a short-lived signed R2 URL, so the app does not proxy large files.
- Deleting a photo removes its master, display image, thumbnail, and Supabase row.
- Existing Supabase images continue to render and download through the legacy fallback. Migrate them gradually: download each source and re-upload it from `/admin` after R2 is configured.

## Cost guardrails

R2’s free tier is 10 GB-month of Standard storage, 1 million Class A writes, 10 million Class B reads, and free egress. Use Standard for this archive: Infrequent Access adds retrieval charges and is a poor match for gallery images. A 15 MB original plus roughly 2 MB display image and 0.2 MB thumbnail uses about 17 MB per photo, so 10 GB is roughly 600 photographs.

Set a Cloudflare billing alert and keep the public domain behind Cloudflare caching. The public web and thumbnail objects are immutable and cache for one year; when replacing a photo, upload a new object instead of overwriting an existing key.
