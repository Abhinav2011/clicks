"use client";

import { useState } from "react";
import type { Photo } from "@/lib/types";
import PhotoCard from "./PhotoCard";
import PhotoModal from "./PhotoModal";

interface MasonryGridProps {
  photos: Photo[];
  hasMore: boolean;
  onLoadMore: () => void;
  loading: boolean;
}

export default function MasonryGrid({
  photos,
  hasMore,
  onLoadMore,
  loading,
}: MasonryGridProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const openModal = (photo: Photo, index: number) => {
    setSelectedPhoto(photo);
    setSelectedIndex(index);
    if (typeof window !== "undefined") {
      window.history.pushState({ photoId: photo.id }, "", `/photo/${photo.id}`);
    }
  };

  const closeModal = () => {
    setSelectedPhoto(null);
    if (typeof window !== "undefined") {
      window.history.pushState({}, "", "/");
    }
  };

  const navigateModal = (direction: "prev" | "next") => {
    const newIndex =
      direction === "next"
        ? Math.min(selectedIndex + 1, photos.length - 1)
        : Math.max(selectedIndex - 1, 0);
    const targetPhoto = photos[newIndex];
    setSelectedIndex(newIndex);
    setSelectedPhoto(targetPhoto);
    if (typeof window !== "undefined" && targetPhoto) {
      window.history.replaceState({ photoId: targetPhoto.id }, "", `/photo/${targetPhoto.id}`);
    }
  };

  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        {/* Vector camera ornament */}
        <svg
          viewBox="0 0 64 48"
          fill="none"
          className="w-16 h-12 text-ink-muted mb-5 opacity-40"
          aria-hidden="true"
        >
          <rect x="2" y="10" width="60" height="36" rx="3" stroke="currentColor" strokeWidth="2" />
          <circle cx="32" cy="28" r="10" stroke="currentColor" strokeWidth="2" />
          <circle cx="32" cy="28" r="5" stroke="currentColor" strokeWidth="1.5" />
          <rect x="20" y="2" width="24" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
          <circle cx="8" cy="18" r="2.5" fill="currentColor" opacity="0.5" />
        </svg>
        <p className="font-serif text-xl text-ink font-semibold">No photos found</p>
        <p className="text-xs uppercase tracking-[0.12em] text-ink-muted mt-2 font-sans">
          Try a different filter or check back soon.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="masonry-grid">
        {photos.map((photo, i) => (
          <PhotoCard
            key={photo.id}
            photo={photo}
            index={i}
            onClick={() => openModal(photo, i)}
          />
        ))}
      </div>

      {/* Load more — flat vector button */}
      {hasMore && (
        <div className="flex justify-center mt-12">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="px-7 py-3 rounded-full border border-border bg-paper-alt text-ink font-sans text-xs font-semibold
                       tracking-[0.04em]
                       hover:bg-amber hover:text-paper hover:border-amber
                       transition-all duration-150
                       disabled:opacity-40 disabled:cursor-not-allowed
                       hover:-translate-y-0.5"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Loading…
              </span>
            ) : (
              "Load more photos"
            )}
          </button>
        </div>
      )}

      {/* Modal */}
      {selectedPhoto && (
        <PhotoModal
          photo={selectedPhoto}
          onClose={closeModal}
          onPrev={selectedIndex > 0 ? () => navigateModal("prev") : undefined}
          onNext={
            selectedIndex < photos.length - 1
              ? () => navigateModal("next")
              : undefined
          }
        />
      )}
    </>
  );
}
