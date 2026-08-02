"use client";

import { useCallback, useEffect, useState } from "react";
import { Camera, Sparkles } from "lucide-react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import MasonryGrid from "@/components/MasonryGrid";
import type { Photo } from "@/lib/types";

function ArchiveIntro({ activeTag, tags, onTagChange }: { activeTag: string | null; tags: string[]; onTagChange: (tag: string | null) => void }) {
  return (
    <section className="archive-intro">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="archive-intro__inner">
          <div className="archive-intro__copy">
            <p className="archive-kicker"><Camera size={14} /> A quiet Fujifilm photo diary</p>
            <h1>Still Frames, collected slowly.</h1>
            <p>Small moments from walks, weekends, and everywhere in between.</p>
          </div>
          <div className="archive-intro__note"><Sparkles size={15} /><span>Made with a little<br />more time to look.</span></div>
        </div>
        {tags.length > 0 && (
          <div className="archive-filters" aria-label="Filter photographs">
            <button onClick={() => onTagChange(null)} className={`tag-pill ${activeTag === null ? "active" : ""}`}>All photographs</button>
            {tags.map((tag) => <button key={tag} onClick={() => onTagChange(tag)} className={`tag-pill ${activeTag === tag ? "active" : ""}`}>{tag}</button>)}
          </div>
        )}
      </div>
    </section>
  );
}

export default function Home() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);

  const fetchPhotos = useCallback(async (pageNum: number, tag: string | null, append = false) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(pageNum) });
      if (tag) params.set("tag", tag);
      const response = await fetch(`/api/photos?${params}`);
      const data = await response.json();
      setPhotos((previous) => append ? [...previous, ...data.photos] : data.photos);
      setHasMore(data.hasMore);
      setPage(pageNum);
    } catch (error) {
      console.error("Failed to fetch photos:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(async () => {
      await fetchPhotos(1, null);
      fetch("/api/tags").then((response) => response.json()).then((data) => setTags(data.tags || [])).catch(() => {});
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
        <ArchiveIntro activeTag={activeTag} tags={tags} onTagChange={handleTagChange} />
        <section className="gallery-section mx-auto max-w-7xl px-5 pb-14 pt-8 sm:px-8 sm:pb-20 lg:px-10">
          <div className="gallery-heading">
            <div><p>THE ARCHIVE</p><h2>Recent <span>frames</span></h2></div>
            <p className="gallery-heading__aside">Tap a photograph to look closer</p>
          </div>
          {loading && photos.length === 0 ? (
            <div className="masonry-grid">{Array.from({ length: 8 }).map((_, index) => <div key={index} className="masonry-item"><div className="animate-shimmer" style={{ height: `${[300, 420, 260, 360][index % 4]}px` }} /></div>)}</div>
          ) : <MasonryGrid photos={photos} hasMore={hasMore} onLoadMore={() => fetchPhotos(page + 1, activeTag, true)} loading={loading} />}
        </section>
      </main>
      <Footer />
    </div>
  );
}
