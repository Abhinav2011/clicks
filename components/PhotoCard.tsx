"use client";

import Image from "next/image";
import Link from "next/link";
import { Download, Share2, Camera } from "lucide-react";
import { motion } from "framer-motion";
import type { Photo } from "@/lib/types";

interface PhotoCardProps {
  photo: Photo;
  index: number;
  onClick: () => void;
}

export default function PhotoCard({ photo, index, onClick }: PhotoCardProps) {
  const imageAlt = [
    photo.title || "Fujifilm photograph",
    photo.location && `photographed in ${photo.location}`,
    photo.film_simulation && `using Fujifilm ${photo.film_simulation}`,
  ].filter(Boolean).join(", ");
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
      className={`masonry-item group cursor-pointer sm:${cardTilt}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.03, ease: "easeOut" }}
      layout
    >
      <div className="polaroid-card" onClick={onClick}>
        {/* Tape Accent strip on top of every 3rd card for scrapbooking touch */}
        {index % 3 === 0 && <div className="tape-accent" />}

        {/* Photo Container */}
        <Link
          href={`/photo/${photo.id}`}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onClick();
          }}
          className="polaroid-image-container block"
          aria-label={`View ${photo.title || "photograph"}`}
        >
          <Image
            src={photo.thumbnail_url}
            alt={imageAlt}
            width={photo.width}
            height={photo.height}
            className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1400px) 33vw, 25vw"
          />
        </Link>

        {/* Polaroid Caption & EXIF Typewriter Footer */}
        <div className="polaroid-caption-area">
          <div className="flex items-start justify-between gap-2">
            <h3 className="polaroid-title line-clamp-1" title={photo.title}>
              {photo.title || "Untitled Frame"}
            </h3>

            {/* Actions: Copy Link, Download & Pinterest */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const url = `${window.location.origin}/photo/${photo.id}`;
                  const media = photo.web_image_url || photo.thumbnail_url;
                  const desc = `${photo.title || "Fujifilm Photograph"} — Shot on ${photo.camera || "Fujifilm"} with ${photo.film_simulation || "film simulation"}. Explore EXIF specs & recipe on Still Frames. #fujifilm #photography #stillframes`;
                  window.open(
                    `https://www.pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&media=${encodeURIComponent(media)}&description=${encodeURIComponent(desc)}`,
                    "_blank",
                    "width=750,height=600"
                  );
                }}
                className="p-1.5 bg-paper-alt hover:bg-red-50 border border-border rounded transition-colors text-red-600"
                title="Save to Pinterest"
                aria-label={`Pin ${photo.title} to Pinterest`}
              >
                <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
                </svg>
              </button>
              <button
                onClick={handleCopyDirectLink}
                className="p-1.5 bg-paper-alt hover:bg-paper border border-border rounded transition-colors"
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
                className="p-1.5 bg-paper-alt hover:bg-paper border border-border rounded transition-colors"
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
