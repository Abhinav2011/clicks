"use client";

import Image from "next/image";
import { Download, Share2, Camera } from "lucide-react";
import { motion } from "framer-motion";
import type { Photo } from "@/lib/types";

interface PhotoCardProps {
  photo: Photo;
  index: number;
  onClick: () => void;
}

export default function PhotoCard({ photo, index, onClick }: PhotoCardProps) {
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

  // Add slight random-feeling tilt to photo cards for analog paper layout vibe
  const tilts = ["rotate-[0.4deg]", "-rotate-[0.5deg]", "rotate-[0.8deg]", "-rotate-[0.3deg]"];
  const cardTilt = tilts[index % tilts.length];

  return (
    <motion.div
      className={`masonry-item group cursor-pointer ${cardTilt}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.03, ease: "easeOut" }}
      layout
    >
      <div className="polaroid-card" onClick={onClick}>
        {/* Tape Accent strip on top of every 3rd card for scrapbooking touch */}
        {index % 3 === 0 && <div className="tape-accent" />}

        {/* Photo Container */}
        <div className="polaroid-image-container">
          <Image
            src={photo.thumbnail_url}
            alt={photo.title || "Photograph"}
            width={photo.width}
            height={photo.height}
            className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1400px) 33vw, 25vw"
          />
        </div>

        {/* Polaroid Caption & EXIF Typewriter Footer */}
        <div className="polaroid-caption-area">
          <div className="flex items-start justify-between gap-2">
            <h3 className="polaroid-title line-clamp-1" title={photo.title}>
              {photo.title || "Untitled Frame"}
            </h3>

            {/* Actions: Copy Link & Download */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={handleCopyDirectLink}
                className="p-1.5 bg-paper-alt hover:bg-paper border border-border-dark rounded transition-colors"
                title="Copy Direct Link"
                aria-label={`Copy link for ${photo.title}`}
              >
                <Share2 size={12} className="text-ink" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(`/api/download/${photo.id}`, "_blank");
                }}
                className="p-1.5 bg-paper-alt hover:bg-paper border border-border-dark rounded transition-colors"
                title="Download Full Resolution"
                aria-label={`Download ${photo.title}`}
              >
                <Download size={12} className="text-ink" />
              </button>
            </div>
          </div>

          {/* EXIF Metadata Row */}
          <div className="polaroid-exif-row">
            <div className="flex items-center gap-1.5 flex-wrap">
              {photo.camera && (
                <span className="inline-flex items-center gap-1 text-[0.7rem] font-bold text-ink">
                  <Camera size={12} className="text-accent shrink-0" />
                  {photo.camera}
                </span>
              )}
              {photo.film_simulation && (
                <span className="exif-badge">
                  🎞️ {photo.film_simulation}
                </span>
              )}
            </div>

            {photo.created_at && (
              <span className="text-[0.68rem] font-bold text-ink-muted shrink-0">
                {new Date(photo.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  year: "2-digit",
                })}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
