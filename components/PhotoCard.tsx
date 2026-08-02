"use client";

import Image from "next/image";
import { Download } from "lucide-react";
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

  return (
    <motion.div
      className="masonry-item group cursor-pointer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.04, ease: "easeOut" }}
      layout
    >
      <div
        className="relative overflow-hidden rounded-lg shadow-sm hover:shadow-lg
                    transition-shadow duration-300"
        onClick={onClick}
      >
        {/* Image */}
        <Image
          src={photo.thumbnail_url}
          alt={photo.title || "Photograph"}
          width={photo.width}
          height={photo.height}
          className="w-full h-auto object-cover transition-transform duration-500
                     group-hover:scale-[1.03]"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1400px) 33vw, 25vw"
        />

        {/* Hover overlay */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent
                      opacity-0 group-hover:opacity-100 transition-opacity duration-300
                      flex flex-col justify-end p-4"
        >
          {/* Title */}
          <h3 className="text-white font-serif text-lg font-medium leading-tight mb-1">
            {photo.title}
          </h3>

          {/* Meta row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Film simulation badge */}
              {photo.film_simulation && filmColor && (
                <span
                  className="film-badge"
                  style={{ backgroundColor: filmColor }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-white/80"
                    aria-hidden="true"
                  />
                  {photo.film_simulation}
                </span>
              )}
            </div>

            {/* Quick download */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                window.open(`/api/download/${photo.id}`, "_blank");
              }}
              className="p-2 rounded-full bg-white/20 hover:bg-white/40
                         backdrop-blur-sm transition-colors duration-200"
              aria-label={`Download ${photo.title}`}
            >
              <Download size={16} className="text-white" strokeWidth={1.8} />
            </button>
          </div>
        </div>
      </div>

      {/* Below-card info (always visible on mobile) */}
      <div className="mt-2 px-0.5 md:hidden">
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
