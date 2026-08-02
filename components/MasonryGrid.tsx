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
  };

  const closeModal = () => setSelectedPhoto(null);

  const navigateModal = (direction: "prev" | "next") => {
    const newIndex =
      direction === "next"
        ? Math.min(selectedIndex + 1, photos.length - 1)
        : Math.max(selectedIndex - 1, 0);
    setSelectedIndex(newIndex);
    setSelectedPhoto(photos[newIndex]);
  };

  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-paper-alt flex items-center justify-center mb-4">
          <span className="text-2xl">📷</span>
        </div>
        <p className="font-serif text-xl text-ink-muted">No photos found</p>
        <p className="text-sm text-ink-muted mt-1">
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

      {/* Load more */}
      {hasMore && (
        <div className="flex justify-center mt-12">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="group relative px-8 py-3 rounded-full font-sans text-sm font-medium
                       text-ink-muted border border-border hover:border-amber hover:text-amber-dark
                       transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-amber/30 border-t-amber rounded-full animate-spin" />
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
