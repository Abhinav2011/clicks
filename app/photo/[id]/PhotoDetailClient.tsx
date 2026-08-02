"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Download,
  Share2,
  Check,
  Camera,
  Aperture,
  Timer,
  Gauge,
  Focus,
  MapPin,
  ZoomIn,
  ZoomOut,
  ExternalLink,
} from "lucide-react";
import type { Photo } from "@/lib/types";
import { FILM_SIM_COLORS } from "@/lib/types";

export default function PhotoDetailClient({ photo }: { photo: Photo }) {
  const [zoomed, setZoomed] = useState(false);
  const [copied, setCopied] = useState(false);

  const filmColor = photo.film_simulation
    ? FILM_SIM_COLORS[photo.film_simulation]
    : null;

  const directUrl = typeof window !== "undefined" ? window.location.href : `/photo/${photo.id}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  const pinterestShareUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(
    directUrl
  )}&media=${encodeURIComponent(
    photo.web_image_url
  )}&description=${encodeURIComponent(
    `${photo.title || "Fujifilm Photograph"} — Shot on ${photo.camera || "Fujifilm"} (${photo.film_simulation || "film sim"})`
  )}`;

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
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      {/* Back button */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 border border-border
                     text-xs font-semibold uppercase tracking-[0.1em] font-sans text-ink
                     hover:bg-ink hover:text-paper transition-colors duration-150"
        >
          <ArrowLeft size={14} />
          Back to Gallery
        </Link>
      </div>

      {/* Main vector container */}
      <div
        className="border-2 border-ink bg-paper overflow-hidden
                    grid grid-cols-1 lg:grid-cols-12
                    shadow-[8px_8px_0_var(--color-amber-dark)]"
      >
        {/* Left: Image Canvas */}
        <div
          className="lg:col-span-8 bg-ink relative flex items-center justify-center
                     min-h-[400px] lg:min-h-[600px] overflow-hidden p-4"
        >
          <Image
            src={photo.web_image_url}
            alt={photo.title || "Photograph"}
            width={photo.width}
            height={photo.height}
            className={`max-w-full max-h-[75vh] object-contain transition-transform duration-300 ${
              zoomed ? "scale-150 cursor-zoom-out" : "cursor-zoom-in"
            }`}
            onClick={() => setZoomed(!zoomed)}
            priority
          />

          {/* Zoom toggle button */}
          <button
            onClick={() => setZoomed(!zoomed)}
            className="absolute bottom-4 right-4 p-2 bg-white/10 hover:bg-amber
                       border border-white/20 hover:border-amber transition-colors text-white"
            aria-label={zoomed ? "Zoom out" : "Zoom in"}
          >
            {zoomed ? <ZoomOut size={16} /> : <ZoomIn size={16} />}
          </button>
        </div>

        {/* Right: Metadata & Actions Panel */}
        <div className="lg:col-span-4 p-6 sm:p-8 flex flex-col justify-between border-t-2 lg:border-t-0 lg:border-l-2 border-ink bg-paper">
          <div>
            {/* Title */}
            <h1 className="font-serif text-3xl font-bold text-ink leading-tight mb-2">
              {photo.title}
            </h1>

            {/* Description */}
            {photo.description && (
              <p className="text-sm text-ink-muted leading-relaxed mb-6 font-sans">
                {photo.description}
              </p>
            )}

            {/* Film simulation badge */}
            {photo.film_simulation && filmColor && (
              <div className="mb-6">
                <p className="text-[0.62rem] uppercase tracking-[0.18em] text-ink-muted mb-2 font-semibold font-sans">
                  Film Simulation
                </p>
                <span
                  className="film-badge text-xs"
                  style={{ backgroundColor: filmColor }}
                >
                  {photo.film_simulation}
                </span>
              </div>
            )}

            {/* EXIF Data Grid */}
            {exifItems.length > 0 && (
              <div className="mb-6 pt-4 border-t border-border">
                <p className="text-[0.62rem] uppercase tracking-[0.18em] text-ink-muted mb-3 font-semibold font-sans">
                  Camera Parameters
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {exifItems.map((item) => (
                    <div key={item.label} className="flex items-center gap-2">
                      <item.icon size={14} className="text-amber flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[0.58rem] text-ink-muted uppercase tracking-wider font-sans">
                          {item.label}
                        </p>
                        <p className="text-ink font-semibold truncate text-xs font-sans">
                          {item.value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {photo.tags && photo.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-6">
                {photo.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 border border-border bg-paper-alt text-ink-muted
                               text-[0.62rem] font-semibold uppercase tracking-[0.06em] font-sans"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-6 border-t-2 border-ink flex flex-col gap-2.5">
            {/* Download */}
            <a
              href={`/api/download/${photo.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full px-4 py-3
                         border-2 border-ink bg-ink text-paper
                         text-xs font-semibold uppercase tracking-[0.1em] font-sans
                         hover:bg-paper hover:text-ink transition-all duration-150"
            >
              <Download size={15} strokeWidth={2} />
              Download Full Resolution
            </a>

            <div className="grid grid-cols-2 gap-2">
              {/* Share to Pinterest */}
              <a
                href={pinterestShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 px-3 py-2.5
                           border-2 border-red-600 bg-red-600 text-white
                           text-xs font-semibold uppercase tracking-[0.06em] font-sans
                           hover:bg-red-700 transition-colors duration-150"
              >
                <ExternalLink size={13} />
                Pin it
              </a>

              {/* Copy Direct Link */}
              <button
                onClick={handleCopyLink}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5
                           border-2 border-border text-ink
                           text-xs font-semibold uppercase tracking-[0.06em] font-sans
                           hover:border-amber hover:text-amber-dark transition-colors duration-150"
              >
                {copied ? <Check size={13} /> : <Share2 size={13} />}
                {copied ? "Copied!" : "Copy Link"}
              </button>
            </div>

            {/* Download counter */}
            <p className="text-[0.6rem] text-ink-muted text-center uppercase tracking-widest font-sans mt-1">
              {photo.download_count} total downloads
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
