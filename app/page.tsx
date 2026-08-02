"use client";

import { useState, useCallback, useEffect } from "react";
import Header from "@/components/Header";
import MasonryGrid from "@/components/MasonryGrid";
import Footer from "@/components/Footer";
import type { Photo } from "@/lib/types";

// ── Hero section ─────────────────────────────────────────
function Hero({
  activeTag,
  tags,
  onTagChange,
}: {
  activeTag: string | null;
  tags: string[];
  onTagChange: (tag: string | null) => void;
}) {
  return (
    <section className="relative overflow-hidden pt-16 pb-10 text-center">
      {/* Decorative gradient orb */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                    w-[600px] h-[600px] rounded-full opacity-[0.07]
                    bg-gradient-radial from-amber via-amber-light/50 to-transparent
                    blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-2xl px-4">
        <p className="text-[0.7rem] uppercase tracking-[0.3em] text-amber-dark font-medium mb-3">
          Shot on Fujifilm
        </p>
        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold text-ink leading-tight mb-4">
          Clicks
        </h1>
        <p className="text-ink-muted text-base sm:text-lg leading-relaxed max-w-lg mx-auto mb-8">
          A curated collection of moments captured through Fujifilm glass. 
          Each frame tells its own story — explore, download, and enjoy.
        </p>

        {/* Filter pills below hero */}
        {tags.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => onTagChange(null)}
              className={`
                px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200
                ${
                  activeTag === null
                    ? "bg-ink text-paper shadow-sm"
                    : "bg-paper-alt text-ink-muted hover:text-ink hover:bg-paper-dark/60"
                }
              `}
            >
              All Photos
            </button>
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => onTagChange(tag)}
                className={`
                  px-3.5 py-1.5 rounded-full text-xs font-medium capitalize transition-all duration-200
                  ${
                    activeTag === tag
                      ? "bg-ink text-paper shadow-sm"
                      : "bg-paper-alt text-ink-muted hover:text-ink hover:bg-paper-dark/60"
                  }
                `}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ── Main Home page ────────────────────────────────────────────
export default function Home() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);

  // ── Fetch photos ──
  const fetchPhotos = useCallback(
    async (pageNum: number, tag: string | null, append = false) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: String(pageNum) });
        if (tag) params.set("tag", tag);

        const res = await fetch(`/api/photos?${params}`);
        const data = await res.json();

        setPhotos((prev) =>
          append ? [...prev, ...data.photos] : data.photos
        );
        setHasMore(data.hasMore);
        setPage(pageNum);
      } catch (e) {
        console.error("Failed to fetch photos:", e);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Initial load
  useEffect(() => {
    fetchPhotos(1, null);

    // Fetch tags
    fetch("/api/tags")
      .then((r) => r.json())
      .then((data) => setTags(data.tags || []))
      .catch(() => {});
  }, [fetchPhotos]);

  // Tag change
  const handleTagChange = (tag: string | null) => {
    setActiveTag(tag);
    fetchPhotos(1, tag);
  };

  // Load more
  const handleLoadMore = () => {
    fetchPhotos(page + 1, activeTag, true);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        <Hero
          activeTag={activeTag}
          tags={tags}
          onTagChange={handleTagChange}
        />

        {/* Photo grid */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          {loading && photos.length === 0 ? (
            // Skeleton loader
            <div className="masonry-grid">
              {Array.from({ length: 8 }).map((_, i) => {
                const skeletonHeights = [280, 360, 240, 320, 260, 340, 220, 300];
                return (
                  <div key={i} className="masonry-item">
                    <div
                      className="animate-shimmer rounded-lg"
                      style={{
                        height: `${skeletonHeights[i % skeletonHeights.length]}px`,
                      }}
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <MasonryGrid
              photos={photos}
              hasMore={hasMore}
              onLoadMore={handleLoadMore}
              loading={loading}
            />
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
