"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import Image from "next/image";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Camera,
  Aperture,
  Timer,
  Gauge,
  Focus,
  MapPin,
  Share2,
  ZoomIn,
  ZoomOut,
  ExternalLink,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Photo } from "@/lib/types";
import { FILM_SIM_COLORS } from "@/lib/types";

interface PhotoModalProps {
  photo: Photo;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
}

export default function PhotoModal({
  photo,
  onClose,
  onPrev,
  onNext,
}: PhotoModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [zoomed, setZoomed] = useState(false);
  const [copied, setCopied] = useState(false);

  // ── Keyboard navigation ──
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowLeft":
          onPrev?.();
          break;
        case "ArrowRight":
          onNext?.();
          break;
      }
    },
    [onClose, onPrev, onNext]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [handleKeyDown]);

  const filmColor = photo.film_simulation
    ? FILM_SIM_COLORS[photo.film_simulation]
    : null;

  const photoShareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/photo/${photo.id}`
    : `/photo/${photo.id}`;

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: photo.title, url: photoShareUrl });
    } else {
      await navigator.clipboard.writeText(photoShareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const pinterestShareUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(
    photoShareUrl
  )}&media=${encodeURIComponent(
    photo.web_image_url
  )}&description=${encodeURIComponent(
    `${photo.title || "Fujifilm Photograph"} — Shot on ${photo.camera || "Fujifilm"}`
  )}`;

  // ── EXIF items ──
  const exifItems = [
    { icon: Camera, label: "Camera", value: photo.camera },
    { icon: Focus, label: "Lens", value: photo.lens },
    { icon: Aperture, label: "Aperture", value: photo.aperture },
    { icon: Timer, label: "Shutter", value: photo.shutter_speed },
    { icon: Gauge, label: "ISO", value: photo.iso?.toString() },
    { icon: Focus, label: "Focal Length", value: photo.focal_length },
    { icon: MapPin, label: "Location", value: photo.location },
  ].filter((item) => item.value);

  return (
    <AnimatePresence>
      <motion.div
        ref={overlayRef}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.target === overlayRef.current && onClose()}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-ink/85" />

        {/* Modal container */}
        <motion.div
          className="relative z-10 flex flex-col lg:flex-row w-full max-w-6xl max-h-[90vh]
                     bg-paper border border-border rounded-2xl overflow-hidden
                     shadow-[0_18px_48px_rgba(78,65,55,0.18)]"
          initial={{ scale: 0.97, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.97, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          {/* ─── Left: Image ─── */}
          <div
            className="relative flex-1 min-h-[300px] lg:min-h-0 bg-ink flex items-center
                       justify-center overflow-hidden"
          >
            <Image
              src={photo.web_image_url}
              alt={photo.title || "Full resolution photograph"}
              width={photo.width}
              height={photo.height}
              className={`max-w-full max-h-[60vh] lg:max-h-[85vh] object-contain
                         transition-transform duration-300
                         ${zoomed ? "scale-150 cursor-zoom-out" : "cursor-zoom-in"}`}
              onClick={() => setZoomed(!zoomed)}
              sizes="(max-width: 1024px) 100vw, 60vw"
              priority
            />

            {/* Zoom toggle */}
            <button
              onClick={() => setZoomed(!zoomed)}
              className="absolute bottom-3 right-3 p-1.5 border border-white/30
                         bg-white/10 hover:bg-amber hover:border-amber transition-colors"
              aria-label={zoomed ? "Zoom out" : "Zoom in"}
            >
              {zoomed ? (
                <ZoomOut size={16} className="text-white" />
              ) : (
                <ZoomIn size={16} className="text-white" />
              )}
            </button>

            {/* Prev / Next arrows */}
            {onPrev && (
              <button
                onClick={onPrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2
                           bg-white/10 hover:bg-amber border border-white/20 hover:border-amber
                           transition-colors"
                aria-label="Previous photo"
              >
                <ChevronLeft size={20} className="text-white" />
              </button>
            )}
            {onNext && (
              <button
                onClick={onNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2
                           bg-white/10 hover:bg-amber border border-white/20 hover:border-amber
                           transition-colors"
                aria-label="Next photo"
              >
                <ChevronRight size={20} className="text-white" />
              </button>
            )}
          </div>

          {/* ─── Right: Info Panel ─── */}
          <div className="w-full lg:w-[340px] flex flex-col overflow-y-auto">
            {/* Close */}
            <div className="flex justify-end p-3 border-b border-border-subtle">
              <button
                onClick={onClose}
                className="p-1.5 border border-border hover:border-ink hover:bg-paper-alt transition-colors"
                aria-label="Close"
              >
                <X size={16} className="text-ink-muted" />
              </button>
            </div>

            <div className="px-5 pb-6 flex flex-col gap-5">
              {/* Title & description */}
              <div>
                <h2 className="font-serif text-2xl font-semibold text-ink leading-tight">
                  {photo.title}
                </h2>
                {photo.description && (
                  <p className="mt-2 text-sm text-ink-muted leading-relaxed">
                    {photo.description}
                  </p>
                )}
              </div>

              {/* Film simulation badge */}
              {photo.film_simulation && filmColor && (
                <div>
                  <p className="text-[0.65rem] uppercase tracking-widest text-ink-muted mb-1.5 font-medium">
                    Film Simulation
                  </p>
                  <span
                    className="film-badge text-xs"
                    style={{ backgroundColor: filmColor }}
                  >
                    <span className="w-2 h-2 rounded-full bg-white/80" />
                    {photo.film_simulation}
                  </span>
                </div>
              )}

              {/* EXIF data */}
              {exifItems.length > 0 && (
                <div>
                  <p className="text-[0.65rem] uppercase tracking-widest text-ink-muted mb-2 font-medium">
                    Camera Settings
                  </p>
                  <div className="grid grid-cols-2 gap-2.5">
                    {exifItems.map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center gap-2 text-sm"
                      >
                        <item.icon
                          size={14}
                          className="text-sage flex-shrink-0"
                          strokeWidth={1.5}
                        />
                        <div className="min-w-0">
                          <p className="text-[0.6rem] text-ink-muted uppercase tracking-wider">
                            {item.label}
                          </p>
                          <p className="text-ink font-medium truncate text-xs">
                            {item.value}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {photo.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {photo.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 border border-border bg-paper-alt text-ink-muted
                                 text-[0.62rem] font-medium capitalize uppercase tracking-[0.06em] font-sans"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col gap-2 mt-auto pt-2">
                <a
                  href={`/api/download/${photo.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5
                             border-2 border-ink bg-ink text-paper text-xs font-semibold uppercase tracking-[0.08em] font-sans
                             hover:bg-paper hover:text-ink transition-all duration-150"
                >
                  <Download size={14} strokeWidth={2} />
                  Download Full Res
                </a>

                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={pinterestShareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 px-3 py-2
                               border-2 border-red-600 bg-red-600 text-white text-xs font-semibold uppercase tracking-[0.06em] font-sans
                               hover:bg-red-700 transition-colors duration-150"
                  >
                    <ExternalLink size={13} />
                    Pin it
                  </a>

                  <button
                    onClick={handleShare}
                    className="flex items-center justify-center gap-1.5 px-3 py-2
                               border-2 border-border text-ink-muted text-xs font-semibold uppercase tracking-[0.06em] font-sans
                               hover:border-amber hover:text-amber-dark transition-all duration-150"
                  >
                    <Share2 size={13} strokeWidth={2} />
                    {copied ? "Copied!" : "Link"}
                  </button>
                </div>
              </div>

              {/* Download count */}
              <p className="text-[0.6rem] text-ink-muted text-center">
                {photo.download_count} downloads
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
