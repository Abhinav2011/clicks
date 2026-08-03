"use client";

import { useCallback, useEffect, useState } from "react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import MasonryGrid from "@/components/MasonryGrid";
import type { Photo } from "@/lib/types";

function GalleryHeader({
  activeTag,
  tags,
  onTagChange,
  totalCount,
}: {
  activeTag: string | null;
  tags: string[];
  onTagChange: (tag: string | null) => void;
  totalCount: number;
}) {
  return (
    <div className="pt-8 pb-6 border-b border-border mb-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-medium text-ink tracking-tight">
            Selected Photographs
          </h1>
          <p className="text-sm text-ink-muted mt-1.5 max-w-xl leading-relaxed">
            A ongoing collection of walks, travels, and quiet moments shot on Fujifilm cameras.
          </p>
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 shrink-0" aria-label="Filter photographs">
            <button
              onClick={() => onTagChange(null)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeTag === null
                  ? "bg-ink text-white shadow-sm"
                  : "bg-paper-card text-ink-muted border border-border hover:border-ink hover:text-ink"
              }`}
            >
              All ({totalCount})
            </button>
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => onTagChange(tag)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold capitalize transition-all ${
                  activeTag === tag
                    ? "bg-ink text-white shadow-sm"
                    : "bg-paper-card text-ink-muted border border-border hover:border-ink hover:text-ink"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);

  const fetchPhotos = useCallback(
    async (pageNum: number, tag: string | null, append = false) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: String(pageNum) });
        if (tag) params.set("tag", tag);
        const response = await fetch(`/api/photos?${params}`);
        const data = await response.json();
        setPhotos((previous) =>
          append ? [...previous, ...data.photos] : data.photos
        );
        setHasMore(data.hasMore);
        setPage(pageNum);
      } catch (error) {
        console.error("Failed to fetch photos:", error);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    void Promise.resolve().then(async () => {
      await fetchPhotos(1, null);
      fetch("/api/tags")
        .then((response) => response.json())
        .then((data) => setTags(data.tags || []))
        .catch(() => {});
    });
  }, [fetchPhotos]);

  const handleTagChange = (tag: string | null) => {
    setActiveTag(tag);
    fetchPhotos(1, tag);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="gallery-section mx-auto max-w-7xl px-5 pb-14 sm:px-8 sm:pb-20 lg:px-10">
          <GalleryHeader
            activeTag={activeTag}
            tags={tags}
            onTagChange={handleTagChange}
            totalCount={photos.length}
          />

          {loading && photos.length === 0 ? (
            <div className="masonry-grid">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="masonry-item">
                  <div
                    className="animate-shimmer"
                    style={{
                      height: `${[320, 440, 280, 380][index % 4]}px`,
                    }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <MasonryGrid
              photos={photos}
              hasMore={hasMore}
              onLoadMore={() => fetchPhotos(page + 1, activeTag, true)}
              loading={loading}
            />
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
