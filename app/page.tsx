"use client";

import { useState, useCallback, useEffect } from "react";
import { ArrowDownRight, Aperture, Sparkles } from "lucide-react";
import Header from "@/components/Header";
import MasonryGrid from "@/components/MasonryGrid";
import Footer from "@/components/Footer";
import type { Photo } from "@/lib/types";

function VectorCamera() {
  return (
    <svg viewBox="0 0 520 380" fill="none" aria-hidden="true" className="hero-camera">
      <path d="M92 136h72l30-51h133l30 51h73c24 0 43 19 43 43v113c0 25-19 44-43 44H92c-24 0-43-19-43-44V179c0-24 19-43 43-43Z" fill="currentColor" />
      <rect x="213" y="63" width="98" height="35" rx="8" fill="currentColor" />
      <circle cx="260" cy="235" r="91" fill="var(--color-ink)" stroke="var(--color-paper)" strokeWidth="15" />
      <circle cx="260" cy="235" r="51" fill="var(--color-blue)" />
      <circle cx="260" cy="235" r="23" fill="var(--color-ink)" />
      <circle cx="438" cy="174" r="12" fill="var(--color-paper)" />
      <path d="M60 126 123 64M458 126 396 64" stroke="var(--color-lime)" strokeWidth="14" strokeLinecap="round" />
      <path d="M54 325h412" stroke="var(--color-ink)" strokeWidth="12" strokeLinecap="round" />
    </svg>
  );
}

function Hero({ activeTag, tags, onTagChange }: { activeTag: string | null; tags: string[]; onTagChange: (tag: string | null) => void }) {
  return (
    <section className="hero-shell">
      <div className="hero-sticker hero-sticker--one">FUJI / FILES</div>
      <div className="hero-sticker hero-sticker--two"><Sparkles size={13} /> GOOD LIGHT CLUB</div>
      <div className="hero-grid" aria-hidden="true" />
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 relative z-10">
        <div className="hero-layout">
          <div className="hero-copy">
            <div className="hero-eyebrow"><span /> PERSONAL PHOTO ARCHIVE · 2024—NOW</div>
            <h1>FRAME<br /><em>BY</em> FRAME<span className="hero-dot">.</span></h1>
            <p>Small stories, big colour. A living library of photographs made with Fujifilm cameras and an eye for the in-between.</p>
            <a href="#gallery" className="hero-cta">Explore the roll <ArrowDownRight size={19} /></a>
          </div>
          <div className="hero-art"><VectorCamera /><div className="hero-orbit hero-orbit--a">X-T5</div><div className="hero-orbit hero-orbit--b">35MM</div></div>
        </div>
      </div>
      <div className="hero-ticker" aria-label="Photography themes"><span>STREET</span><i>✦</i><span>PLACES</span><i>✦</i><span>PEOPLE</span><i>✦</i><span>DAYLIGHT</span><i>✦</i><span>COLOUR</span><i>✦</i><span>STREET</span></div>
      {tags.length > 0 && <div className="filter-rail"><div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 flex flex-wrap items-center gap-2"><span className="filter-label">SORT THE ROLL</span><button onClick={() => onTagChange(null)} className={`tag-pill ${activeTag === null ? "active" : ""}`}>All frames</button>{tags.map((tag) => <button key={tag} onClick={() => onTagChange(tag)} className={`tag-pill ${activeTag === tag ? "active" : ""}`}>{tag}</button>)}</div></div>}
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
    try { const params = new URLSearchParams({ page: String(pageNum) }); if (tag) params.set("tag", tag); const res = await fetch(`/api/photos?${params}`); const data = await res.json(); setPhotos((prev) => append ? [...prev, ...data.photos] : data.photos); setHasMore(data.hasMore); setPage(pageNum); } catch (e) { console.error("Failed to fetch photos:", e); } finally { setLoading(false); }
  }, []);
  useEffect(() => {
    const loadInitialContent = async () => {
      await fetchPhotos(1, null);
      fetch("/api/tags").then((r) => r.json()).then((data) => setTags(data.tags || [])).catch(() => {});
    };
    void Promise.resolve().then(loadInitialContent);
  }, [fetchPhotos]);
  const handleTagChange = (tag: string | null) => { setActiveTag(tag); fetchPhotos(1, tag); };
  return <div className="flex flex-col min-h-screen"><Header /><main className="flex-1"><Hero activeTag={activeTag} tags={tags} onTagChange={handleTagChange} /><section id="gallery" className="gallery-section mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 py-12 sm:py-16"><div className="gallery-heading"><div><p>THE CONTACT SHEET</p><h2>Recent <span>frames</span></h2></div><div className="gallery-count"><Aperture size={18} /> {activeTag ? activeTag : "All selected"}</div></div>{loading && photos.length === 0 ? <div className="masonry-grid">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="masonry-item"><div className="animate-shimmer" style={{ height: `${[300, 420, 260, 360][i % 4]}px` }} /></div>)}</div> : <MasonryGrid photos={photos} hasMore={hasMore} onLoadMore={() => fetchPhotos(page + 1, activeTag, true)} loading={loading} />}</section></main><Footer /></div>;
}
