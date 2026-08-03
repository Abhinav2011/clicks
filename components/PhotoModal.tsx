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

  const photoShareUrl =
    typeof window !== "undefined"
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
    `${photo.title || "Fujifilm Photograph"} — Shot on ${photo.camera || "Fujifilm"} with ${photo.film_simulation || "film simulation"}. Explore EXIF specs & recipe on Still Frames. #fujifilm #filmphotography #photographyinspo #stillframes`
  )}`;

  // ── EXIF items ──
  const exifItems = [
    { icon: Camera, label: "Camera", value: photo.camera },
    { icon: Focus, label: "Lens", value: photo.lens },
    { icon: Aperture, label: "Aperture", value: photo.aperture },
    { icon: Timer, label: "Shutter", value: photo.shutter_speed },
    { icon: Gauge, label: "ISO", value: photo.iso?.toString() },
    { icon: Focus, label: "Focal", value: photo.focal_length },
    { icon: MapPin, label: "Location", value: photo.location },
  ].filter((item) => item.value);

  return (
    <AnimatePresence>
      <motion.div
        ref={overlayRef}
        className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.target === overlayRef.current && onClose()}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-[#0f172a]/80 backdrop-blur-md" />

        {/* Modal container */}
        <motion.div
          className="relative z-10 flex flex-col lg:flex-row w-full max-w-6xl max-h-[95dvh] lg:max-h-[90vh]
                     bg-paper-card border border-border rounded-xl overflow-hidden
                     shadow-2xl overflow-y-auto lg:overflow-y-visible"
          initial={{ scale: 0.97, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.97, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          {/* Mobile Top Close Bar */}
          <button
            onClick={onClose}
            className="lg:hidden absolute top-3 right-3 z-30 p-2 rounded-full bg-black/60 text-white hover:bg-black transition-colors"
            aria-label="Close photo"
          >
            <X size={18} />
          </button>

          {/* ─── Left: Image ─── */}
          <div
            className="relative flex-1 min-h-[260px] sm:min-h-[340px] lg:min-h-0 bg-[#141210] flex items-center
                       justify-center overflow-hidden p-2 sm:p-4"
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
              className="absolute bottom-3 right-3 p-2 border border-white/40
                         bg-black/40 hover:bg-terracotta hover:border-terracotta transition-colors rounded-sm"
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
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5
                           bg-black/50 hover:bg-terracotta border border-white/20 hover:border-terracotta
                           transition-colors rounded-sm"
                aria-label="Previous photo"
              >
                <ChevronLeft size={20} className="text-white" />
              </button>
            )}
            {onNext && (
              <button
                onClick={onNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5
                           bg-black/50 hover:bg-terracotta border border-white/20 hover:border-terracotta
                           transition-colors rounded-sm"
                aria-label="Next photo"
              >
                <ChevronRight size={20} className="text-white" />
              </button>
            )}
          </div>

          {/* ─── Right: Logbook Info Panel ─── */}
          <div className="w-full lg:w-[350px] flex flex-col overflow-y-auto bg-paper-card border-t lg:border-t-0 lg:border-l-2 border-dashed border-border-dark">
            {/* Close */}
            <div className="flex items-center justify-between p-4 border-b border-dashed border-border-dark bg-paper-alt">
              <span className="font-mono text-[0.68rem] font-bold text-terracotta tracking-wider uppercase">
                📜 LOGBOOK SHEET #{photo.id ? String(photo.id).slice(-4) : "001"}
              </span>
              <button
                onClick={onClose}
                className="p-1 border border-border-dark hover:border-ink hover:bg-paper transition-colors rounded-sm"
                aria-label="Close"
              >
                <X size={16} className="text-ink" />
              </button>
            </div>

            <div className="p-5 flex flex-col gap-5">
              {/* Title & description */}
              <div>
                <h2 className="font-serif text-2xl font-bold text-ink leading-tight">
                  {photo.title || "Untitled Photograph"}
                </h2>
                {photo.description && (
                  <p className="mt-2.5 font-sans text-sm text-ink-muted leading-relaxed border-l-2 border-terracotta pl-3">
                    {photo.description}
                  </p>
                )}
              </div>

              {/* Film simulation badge */}
              {photo.film_simulation && (
                <div className="bg-paper-alt border border-border-dark p-3 rounded-sm">
                  <p className="font-mono text-[0.63rem] uppercase font-bold text-ink-muted mb-1">
                    FILM SIMULATION STOCK
                  </p>
                  <span className="font-mono text-sm font-bold text-terracotta inline-flex items-center gap-1.5">
                    🎞️ {photo.film_simulation}
                  </span>
                </div>
              )}

              {/* EXIF data */}
              {exifItems.length > 0 && (
                <div>
                  <p className="font-mono text-[0.65rem] uppercase font-bold text-ink-muted mb-2 tracking-wider">
                    TECHNICAL SPECIFICATIONS
                  </p>
                  <div className="grid grid-cols-2 gap-2 font-mono">
                    {exifItems.map((item) => (
                      <div
                        key={item.label}
                        className="p-2 bg-paper-alt border border-border rounded-sm flex flex-col"
                      >
                        <span className="text-[0.6rem] text-ink-light uppercase">
                          {item.label}
                        </span>
                        <span className="text-xs font-bold text-ink truncate mt-0.5">
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {photo.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 font-mono">
                  {photo.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 border border-border-dark bg-paper-alt text-ink-muted
                                 text-[0.65rem] font-bold uppercase rounded-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col gap-2 mt-auto pt-4 border-t border-dashed border-border-dark">
                <a
                  href={`/api/download/${photo.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5
                             border-2 border-ink bg-ink text-paper-card text-xs font-mono font-bold uppercase tracking-wider
                             hover:bg-terracotta hover:border-ink shadow-[2px_3px_0px_var(--color-terracotta)] transition-all duration-150"
                >
                  <Download size={14} strokeWidth={2} />
                  Download Original Print
                </a>

                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={pinterestShareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 px-3 py-2
                               border-2 border-red-800 bg-red-700 text-white text-xs font-mono font-bold uppercase
                               hover:bg-red-800 transition-colors duration-150 rounded-sm"
                  >
                    <ExternalLink size={13} />
                    Pin it
                  </a>

                  <button
                    onClick={handleShare}
                    className="flex items-center justify-center gap-1.5 px-3 py-2
                               border-2 border-border-dark bg-paper-alt text-ink text-xs font-mono font-bold uppercase
                               hover:bg-paper hover:border-ink transition-all duration-150 rounded-sm"
                  >
                    <Share2 size={13} strokeWidth={2} />
                    {copied ? "Copied!" : "Share Link"}
                  </button>
                </div>
              </div>

              {/* Download count */}
              <p className="font-mono text-[0.62rem] text-ink-muted text-center">
                📊 {photo.download_count} total print downloads
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

