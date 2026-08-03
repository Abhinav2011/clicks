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
    <div className="pt-6 sm:pt-8 pb-5 sm:pb-6 border-b border-border mb-6 sm:mb-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 sm:gap-6">
        <div>
          <h1 className="font-serif text-2xl sm:text-4xl font-medium text-ink tracking-tight">
            Selected Photographs
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted mt-1 sm:mt-1.5 max-w-xl leading-relaxed">
            An ongoing collection of walks, travels, and quiet moments shot on Fujifilm cameras.
          </p>
        </div>

        {tags.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar flex-nowrap sm:flex-wrap pb-1 max-w-full shrink-0" aria-label="Filter photographs">
            <button
              onClick={() => onTagChange(null)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
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
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap capitalize transition-all ${
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
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [pageSize, setPageSize] = useState(12);

  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== "undefined") {
        setPageSize(window.innerWidth < 640 ? 8 : 12);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchPhotos = useCallback(
    async (pageNum: number, tag: string | null, append = false, size = pageSize) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(pageNum),
          pageSize: String(size),
        });
        if (tag) params.set("tag", tag);
        const response = await fetch(`/api/photos?${params}`);
        const data = await response.json();
        setPhotos((previous) =>
          append ? [...previous, ...data.photos] : data.photos
        );
        setHasMore(data.hasMore);
        setTotal(data.total || 0);
        setPage(pageNum);
      } catch (error) {
        console.error("Failed to fetch photos:", error);
      } finally {
        setLoading(false);
      }
    },
    [pageSize]
  );

  useEffect(() => {
    void Promise.resolve().then(async () => {
      await fetchPhotos(1, null, false, pageSize);
      fetch("/api/tags")
        .then((response) => response.json())
        .then((data) => setTags(data.tags || []))
        .catch(() => {});
    });
  }, [fetchPhotos, pageSize]);

  const handleTagChange = (tag: string | null) => {
    setActiveTag(tag);
    fetchPhotos(1, tag, false, pageSize);
  };

  const handleMobilePageChange = (newPage: number) => {
    fetchPhotos(newPage, activeTag, false, pageSize);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
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
            totalCount={total || photos.length}
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
              onLoadMore={() => fetchPhotos(page + 1, activeTag, true, pageSize)}
              loading={loading}
              currentPage={page}
              totalPhotos={total || photos.length}
              pageSize={pageSize}
              onPageChange={handleMobilePageChange}
            />
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
