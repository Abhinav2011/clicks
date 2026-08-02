"use client";

import Image from "next/image";
import { Download, Share2 } from "lucide-react";
import { motion } from "framer-motion";
import type { Photo } from "@/lib/types";
import { FILM_SIM_COLORS } from "@/lib/types";

interface PhotoCardProps {
  photo: Photo;
  index: number;
  onClick: () => void;
}

export default function PhotoCard({ photo, index, onClick }: PhotoCardProps) {
  const filmColor = photo.film_simulation
    ? FILM_SIM_COLORS[photo.film_simulation]
    : null;

  const handleCopyDirectLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/photo/${photo.id}`;
    try {
      await navigator.clipboard.writeText(url);
      alert("Direct photo link copied to clipboard!");
    } catch {
      // fallback
    }
  };

  return (
    <motion.div
      className="masonry-item group cursor-pointer photo-card-wrap"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.04, ease: "easeOut" }}
      layout
    >
      {/* Card border — vector flat style */}
      <div
        className="relative overflow-hidden border border-border bg-paper-alt"
        onClick={onClick}
      >
        {/* Image */}
        <Image
          src={photo.thumbnail_url}
          alt={photo.title || "Photograph"}
          width={photo.width}
          height={photo.height}
          className="w-full h-auto object-cover transition-transform duration-400
                     group-hover:scale-[1.02]"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1400px) 33vw, 25vw"
        />

        {/* Hover overlay — editorial dark wash */}
        <div
          className="absolute inset-0 bg-ink/70
                      opacity-0 group-hover:opacity-100 transition-opacity duration-250
                      flex flex-col justify-end p-3.5"
        >
          {/* Title */}
          <h3 className="text-paper font-serif text-base font-semibold leading-tight mb-1.5">
            {photo.title}
          </h3>

          {/* Meta row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {/* Film simulation badge — flat chip */}
              {photo.film_simulation && filmColor && (
                <span
                  className="film-badge"
                  style={{ backgroundColor: filmColor }}
                >
                  {photo.film_simulation}
                </span>
              )}
            </div>

            {/* Quick actions: Share link & Download */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleCopyDirectLink}
                className="p-1.5 bg-paper/20 hover:bg-amber transition-colors duration-150
                           border border-white/30 hover:border-amber"
                title="Copy Direct Link for Pinterest / Sharing"
                aria-label={`Copy link for ${photo.title}`}
              >
                <Share2 size={13} className="text-paper" strokeWidth={2} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(`/api/download/${photo.id}`, "_blank");
                }}
                className="p-1.5 bg-paper/20 hover:bg-amber transition-colors duration-150
                           border border-white/30 hover:border-amber"
                title="Download Full Resolution"
                aria-label={`Download ${photo.title}`}
              >
                <Download size={13} className="text-paper" strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Below-card label — always visible on mobile */}
      <div className="mt-1.5 px-0.5 md:hidden">
        <p className="font-serif text-sm text-ink font-medium truncate">
          {photo.title}
        </p>
        {photo.film_simulation && filmColor && (
          <span
            className="film-badge mt-1 text-[0.6rem]"
            style={{ backgroundColor: filmColor }}
          >
            {photo.film_simulation}
          </span>
        )}
      </div>
    </motion.div>
  );
}
