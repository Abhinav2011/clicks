"use client";

import { useState, useRef, Suspense, useCallback, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import exifr from "exifr";
import {
  Upload,
  Camera,
  CheckCircle2,
  AlertCircle,
  Loader2,
  KeyRound,
  ArrowLeft,
  Sparkles,
  X,
  ChevronDown,
  ChevronUp,
  Images,
  Send,
  Trash2,
  RefreshCw,
  LayoutGrid,
  Download,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { FilmSimulation, Photo } from "@/lib/types";

// ─── Constants ────────────────────────────────────────────────────────────────
const FILM_SIMULATIONS: FilmSimulation[] = [
  "Classic Chrome", "Velvia/Vivid", "ACROS", "Classic Neg.", "Provia/Standard",
  "PRO Neg. Hi", "PRO Neg. Std", "Astia/Soft", "Eterna", "Eterna Bleach Bypass",
  "REALA ACE", "Nostalgic Neg.",
];

// ─── Upload Queue Types ────────────────────────────────────────────────────────
interface QueueItem {
  id: string;
  file: File;
  previewUrl: string;
  exifParsed: boolean;
  title: string;
  description: string;
  camera: string;
  lens: string;
  filmSim: FilmSimulation;
  iso: string;
  aperture: string;
  shutterSpeed: string;
  focalLength: string;
  location: string;
  tags: string;
  status: "pending" | "uploading" | "done" | "error";
  errorMsg: string;
  expanded: boolean;
}

function makeId() { return Math.random().toString(36).slice(2, 10); }

async function extractExif(file: File): Promise<Partial<QueueItem>> {
  try {
    const output = await exifr.parse(file, ["Make","Model","LensModel","ISO","FNumber","ExposureTime","FocalLength"]);
    if (!output) return {};
    return {
      exifParsed: true,
      camera: output.Model || "Fujifilm X-T30 II",
      lens: output.LensModel || "",
      iso: output.ISO ? String(output.ISO) : "",
      aperture: output.FNumber ? `f/${output.FNumber}` : "",
      shutterSpeed: output.ExposureTime
        ? output.ExposureTime < 1 ? `1/${Math.round(1 / output.ExposureTime)}s` : `${output.ExposureTime}s`
        : "",
      focalLength: output.FocalLength ? `${output.FocalLength}mm` : "",
    };
  } catch { return {}; }
}

function buildQueueItem(file: File, exif: Partial<QueueItem>): QueueItem {
  const rawName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
  const title = rawName.charAt(0).toUpperCase() + rawName.slice(1);
  return {
    id: makeId(), file, previewUrl: URL.createObjectURL(file),
    exifParsed: exif.exifParsed ?? false, title, description: "",
    camera: exif.camera ?? "Fujifilm X-T30 II", lens: exif.lens ?? "",
    filmSim: "Classic Chrome", iso: exif.iso ?? "", aperture: exif.aperture ?? "",
    shutterSpeed: exif.shutterSpeed ?? "", focalLength: exif.focalLength ?? "",
    location: "", tags: "", status: "pending", errorMsg: "", expanded: true,
  };
}

// ─── Upload Queue Photo Card ───────────────────────────────────────────────────
function PhotoCard({ item, index, onChange, onRemove }: {
  item: QueueItem; index: number;
  onChange: (id: string, field: keyof QueueItem, value: string | boolean) => void;
  onRemove: (id: string) => void;
}) {
  const inp = (field: keyof QueueItem) => ({
    value: item[field] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      onChange(item.id, field, e.target.value),
    disabled: item.status === "uploading" || item.status === "done",
  });

  const cardBorder = item.status === "done" ? "border-green-400/50"
    : item.status === "error" ? "border-red-400/50"
    : item.status === "uploading" ? "border-amber/60"
    : "border-border";

  return (
    <div className={`border-2 ${cardBorder} rounded-2xl overflow-hidden bg-paper transition-all duration-300`}>
      <div className="flex items-center gap-4 p-4 cursor-pointer select-none hover:bg-paper-alt/30 transition-colors"
        onClick={() => onChange(item.id, "expanded", !item.expanded)}>
        <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 shadow-sm">
          <Image src={item.previewUrl} alt={item.title} fill className="object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-ink truncate">{item.title || `Photo ${index + 1}`}</p>
          {item.exifParsed && <p className="text-xs text-amber-dark flex items-center gap-1 mt-0.5"><Sparkles size={10} /> EXIF auto-extracted</p>}
          {item.status === "error" && <p className="text-xs text-red-500 mt-0.5 truncate">{item.errorMsg}</p>}
          {item.status === "done" && <p className="text-xs text-green-600 mt-0.5">Published successfully!</p>}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {item.status === "done" && <CheckCircle2 size={16} className="text-green-600" />}
          {item.status === "error" && <AlertCircle size={16} className="text-red-500" />}
          {item.status === "uploading" && <Loader2 size={16} className="animate-spin text-amber" />}
          {item.status !== "uploading" && item.status !== "done" && (
            <button type="button" onClick={(e) => { e.stopPropagation(); onRemove(item.id); }}
              className="p-1 text-ink-muted hover:text-red-500 transition-colors" title="Remove">
              <X size={15} />
            </button>
          )}
          {item.expanded ? <ChevronUp size={16} className="text-ink-muted" /> : <ChevronDown size={16} className="text-ink-muted" />}
        </div>
      </div>
      {item.expanded && (
        <div className="border-t border-border p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-semibold text-ink-muted uppercase tracking-widest mb-1">Title *</label>
              <input type="text" {...inp("title")} placeholder="e.g. Rainy Evening in Kyoto"
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-paper-alt/50 text-ink focus:outline-none focus:border-amber" />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-ink-muted uppercase tracking-widest mb-1">Location</label>
              <input type="text" {...inp("location")} placeholder="e.g. Tokyo, Japan"
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-paper-alt/50 text-ink focus:outline-none focus:border-amber" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-ink-muted uppercase tracking-widest mb-1">Description</label>
            <textarea rows={2} {...inp("description")} placeholder="Brief story about this frame..."
              className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-paper-alt/50 text-ink focus:outline-none focus:border-amber resize-none" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {([["camera","Camera"],["lens","Lens"],["iso","ISO"],["aperture","Aperture"],["shutterSpeed","Shutter"],["focalLength","Focal Length"]] as [keyof QueueItem, string][]).map(([field, label]) => (
              <div key={field}>
                <label className="block text-[10px] font-semibold text-ink-muted uppercase tracking-widest mb-1">{label}</label>
                <input type={field === "iso" ? "number" : "text"} {...inp(field)} placeholder={field === "iso" ? "160" : undefined}
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-paper-alt/50 text-ink focus:outline-none focus:border-amber" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-ink-muted uppercase tracking-widest mb-1">Film Simulation</label>
              <select {...inp("filmSim")} className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-paper-alt/50 text-ink focus:outline-none focus:border-amber cursor-pointer">
                {FILM_SIMULATIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-ink-muted uppercase tracking-widest mb-1">Tags (comma separated)</label>
              <input type="text" {...inp("tags")} placeholder="street, night, classic chrome"
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-paper-alt/50 text-ink focus:outline-none focus:border-amber" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Pinterest Pin Generator Modal ─────────────────────────────────────────────
function loadCanvasImage(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not load the photo for the Pin image."));
    image.src = source;
  });
}

function drawCover(context: CanvasRenderingContext2D, image: HTMLImageElement, x: number, y: number, width: number, height: number) {
  const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
  const sourceWidth = width / scale;
  const sourceHeight = height / scale;
  context.drawImage(image, (image.naturalWidth - sourceWidth) / 2, (image.naturalHeight - sourceHeight) / 2, sourceWidth, sourceHeight, x, y, width, height);
}

function drawWrappedText(context: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const words = text.trim().split(/\s+/);
  let line = "";
  let currentY = y;
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (context.measureText(next).width > maxWidth && line) {
      context.fillText(line, x, currentY);
      line = word;
      currentY += lineHeight;
    } else line = next;
  }
  if (line) context.fillText(line, x, currentY);
  return currentY;
}

function PinterestPinModal({ photo, onClose }: { photo: Photo; onClose: () => void }) {
  const defaultTitle = `${photo.title || "Fujifilm Photograph"} — ${photo.film_simulation || "Classic Chrome"} | Still Frames`;
  const simClean = (photo.film_simulation || "classicchrome").toLowerCase().replace(/[^a-z0-9]/g, "");
  const locClean = (photo.location || "india").toLowerCase().replace(/[^a-z0-9]/g, "");
  const defaultDesc = `Quiet moment captured on ${photo.camera || "Fujifilm X-T30 II"} using ${
    photo.film_simulation || "Classic Chrome"
  } film simulation recipe. Location: ${
    photo.location || "India"
  }. Explore full resolution photograph, EXIF specs, and recipe settings on Still Frames. #fujifilm #filmphotography #${simClean} #${locClean} #streetphotography #photographyinspo #stillframes`;

  const [pinTitle, setPinTitle] = useState(defaultTitle);
  const [pinDesc, setPinDesc] = useState(defaultDesc);
  const [copied, setCopied] = useState(false);
  const [pinPreview, setPinPreview] = useState<string | null>(null);
  const [generatingPin, setGeneratingPin] = useState(false);
  const [pinError, setPinError] = useState("");

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://www.stillframes.net";
  const targetUrl = `${baseUrl}/photo/${photo.id}`;
  const imageUrl = photo.web_image_url || photo.thumbnail_url;

  const generatePin = async () => {
    setGeneratingPin(true);
    setPinError("");
    try {
      const image = await loadCanvasImage(imageUrl);
      const canvas = document.createElement("canvas");
      canvas.width = 1000;
      canvas.height = 1500;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Your browser cannot create a Pin image.");

      context.fillStyle = "#fbf8f3";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = "#b96d52";
      context.fillRect(0, 0, canvas.width, 24);
      context.fillStyle = "#4e4137";
      context.font = "600 22px ui-rounded, Avenir, sans-serif";
      context.letterSpacing = "2px";
      context.fillText("STILL FRAMES", 74, 82);
      context.fillStyle = "#8a7c70";
      context.font = "500 18px ui-rounded, Avenir, sans-serif";
      context.fillText("FUJIFILM PHOTO DIARY", 74, 116);

      context.save();
      context.beginPath();
      context.roundRect(64, 152, 872, 930, 24);
      context.clip();
      drawCover(context, image, 64, 152, 872, 930);
      context.restore();

      context.fillStyle = "#4e4137";
      context.font = "500 56px Georgia, serif";
      const finalY = drawWrappedText(context, photo.title || "A quiet frame", 74, 1172, 830, 68);
      context.fillStyle = "#b96d52";
      context.font = "600 20px ui-rounded, Avenir, sans-serif";
      const details = [photo.location, photo.film_simulation, photo.camera].filter(Boolean).join("  ·  ");
      context.fillText(details || "A moment from the archive", 74, Math.min(finalY + 62, 1420));
      context.fillStyle = "#e9dfd2";
      context.fillRect(74, 1438, 852, 2);
      context.fillStyle = "#8a7c70";
      context.font = "500 16px ui-rounded, Avenir, sans-serif";
      context.fillText("stillframes.net", 74, 1474);

      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) throw new Error("Could not export the Pin image.");
      if (pinPreview) URL.revokeObjectURL(pinPreview);
      setPinPreview(URL.createObjectURL(blob));
    } catch (error) {
      setPinError(error instanceof Error ? error.message : "Could not generate the Pin image.");
    } finally {
      setGeneratingPin(false);
    }
  };

  const downloadPin = () => {
    if (!pinPreview) return;
    const filename = `${(photo.title || "still-frames").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-pinterest.png`;
    const link = document.createElement("a");
    link.href = pinPreview;
    link.download = filename;
    link.click();
  };

  const openPinterestPublisher = () => window.open("https://www.pinterest.com/pin-builder/", "_blank", "noopener,noreferrer");

  const handleCopyCopy = async () => {
    const copy = `Title: ${pinTitle}\n\nDescription:\n${pinDesc}\n\nLink: ${targetUrl}`;
    await navigator.clipboard.writeText(copy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-paper rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-border flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-xs">
              P
            </div>
            <h3 className="font-serif text-lg font-semibold text-ink">
              Pinterest SEO Pin Generator
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-ink-muted hover:text-ink">
            <X size={18} />
          </button>
        </div>

        {/* Thumbnail preview */}
        <div className="flex items-center gap-3 bg-paper-alt p-3 rounded-xl border border-border">
          <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-ink">
            <Image src={imageUrl} alt={photo.title} fill className="object-cover" />
          </div>
          <div className="overflow-hidden text-xs">
            <p className="font-semibold text-ink truncate">{photo.title}</p>
            <p className="text-ink-muted">{photo.camera || "Fujifilm"} · {photo.film_simulation || "Classic Chrome"}</p>
            <p className="text-accent text-[0.7rem] font-mono mt-0.5 truncate">{targetUrl}</p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-paper-alt/50 p-3">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <p className="text-xs font-semibold text-ink">Vertical Pin image</p>
              <p className="text-[0.7rem] text-ink-muted mt-0.5">1000 × 1500 PNG with the photograph and archive details.</p>
            </div>
            <button
              onClick={generatePin}
              disabled={generatingPin}
              className="shrink-0 px-3 py-2 rounded-lg bg-ink text-paper text-xs font-semibold hover:bg-ink-light disabled:opacity-60 flex items-center gap-1.5"
            >
              {generatingPin ? <><Loader2 size={13} className="animate-spin" /> Creating</> : <><Images size={13} /> Create image</>}
            </button>
          </div>
          {pinPreview && <img src={pinPreview} alt="Generated vertical Pinterest Pin" className="w-32 mx-auto rounded-md shadow-sm border border-border" />}
          {pinError && <p className="text-xs text-red-600 mt-2">{pinError}</p>}
        </div>

        {/* SEO Title Input */}
        <div>
          <label className="block text-xs font-semibold text-ink mb-1">
            📌 Pinterest Pin Title (SEO Keywords)
          </label>
          <input
            type="text"
            value={pinTitle}
            onChange={(e) => setPinTitle(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-border text-xs text-ink bg-paper font-sans"
          />
        </div>

        {/* SEO Description Input */}
        <div>
          <label className="block text-xs font-semibold text-ink mb-1">
            📝 Pinterest SEO Description & Hashtags
          </label>
          <textarea
            rows={4}
            value={pinDesc}
            onChange={(e) => setPinDesc(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-border text-xs text-ink bg-paper font-sans leading-relaxed"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
          <button
            onClick={handleCopyCopy}
            className="flex-1 py-2.5 px-4 rounded-xl border border-border bg-paper-alt text-ink font-sans text-xs font-semibold hover:bg-paper transition-colors"
          >
            {copied ? "Copied to Clipboard!" : "Copy SEO Text"}
          </button>
          <button onClick={downloadPin} disabled={!pinPreview} className="flex-1 py-2.5 px-4 rounded-xl bg-accent text-white font-sans text-xs font-semibold disabled:opacity-40 hover:opacity-90 transition-colors flex items-center justify-center gap-1.5">
            <Download size={14} /> Download Pin
          </button>
          <button
            onClick={openPinterestPublisher}
            className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 text-white font-sans text-xs font-semibold hover:bg-red-700 transition-colors shadow-md flex items-center justify-center gap-1.5"
          >
            📌 Open Pinterest
          </button>
        </div>
        <p className="text-[0.68rem] text-ink-muted -mt-2">Download the generated image, then upload it in Pinterest and paste the title, description, and destination link above.</p>
      </div>
    </div>
  );
}

// ─── Manage & Delete Panel ─────────────────────────────────────────────────────
function ManagePanel({ passkey }: { passkey: string }) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const [deleteResult, setDeleteResult] = useState<{ ok: number; fail: number; errorMsg?: string } | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const fetchPhotos = useCallback(async () => {
    setLoading(true);
    setDeleteResult(null);
    try {
      const res = await fetch("/api/photos?page=1");
      const data = await res.json();
      // Fetch all pages if needed
      let all: Photo[] = data.photos || [];
      let page = 2;
      while (data.hasMore || (all.length < (data.total || 0))) {
        const r = await fetch(`/api/photos?page=${page}`);
        const d = await r.json();
        all = [...all, ...(d.photos || [])];
        if (!d.hasMore) break;
        page++;
      }
      setPhotos(all);
    } catch {
      setPhotos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void Promise.resolve().then(fetchPhotos); }, [fetchPhotos]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelected(new Set(photos.map((p) => p.id)));
  const deselectAll = () => setSelected(new Set());
  const allSelected = photos.length > 0 && selected.size === photos.length;

  const handleDelete = async () => {
    if (!selected.size) return;
    setDeleting(true);
    setConfirmOpen(false);
    try {
      const res = await fetch("/api/admin/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-admin-passkey": passkey,
        },
        body: JSON.stringify({ ids: Array.from(selected) }),
      });
      const data = await res.json();
      if (res.ok) {
        setDeleteResult({ ok: data.deleted, fail: 0 });
        setSelected(new Set());
        await fetchPhotos();
      } else {
        setDeleteResult({ ok: 0, fail: selected.size, errorMsg: data.error || "Delete failed. Please check your passkey." });
      }
    } catch (err) {
      setDeleteResult({ ok: 0, fail: selected.size, errorMsg: err instanceof Error ? err.message : "Delete failed." });
    } finally {
      setDeleting(false);
    }
  };

  const [pinModalPhoto, setPinModalPhoto] = useState<Photo | null>(null);

  if (loading) return (
    <div className="flex items-center justify-center py-20 gap-3 text-ink-muted">
      <Loader2 size={22} className="animate-spin" />
      <span className="text-sm">Loading your photos...</span>
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="glass-card rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-sm text-ink font-medium">{photos.length} photo{photos.length !== 1 ? "s" : ""} in gallery</span>
          {photos.length > 0 && (
            <button onClick={allSelected ? deselectAll : selectAll}
              className="text-xs text-amber-dark hover:underline font-medium">
              {allSelected ? "Deselect all" : "Select all"}
            </button>
          )}
          {selected.size > 0 && (
            <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">
              {selected.size} selected
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchPhotos} title="Refresh"
            className="p-2 text-ink-muted hover:text-ink border border-border rounded-lg transition-colors">
            <RefreshCw size={15} />
          </button>
          <button
            onClick={() => setConfirmOpen(true)}
            disabled={selected.size === 0 || deleting}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium
                       hover:bg-red-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {deleting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
            {deleting ? "Deleting..." : `Delete ${selected.size > 0 ? selected.size : ""} Selected`}
          </button>
        </div>
      </div>

      {/* Delete result feedback */}
      {deleteResult && (
        <div className={`flex items-center gap-2 p-3 rounded-xl text-sm font-medium
          ${deleteResult.ok > 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
          {deleteResult.ok > 0 ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {deleteResult.ok > 0
            ? `${deleteResult.ok} photo${deleteResult.ok > 1 ? "s" : ""} permanently deleted.`
            : (deleteResult.errorMsg || "Delete failed. Please try again.")}
        </div>
      )}

      {/* Photo grid */}
      {photos.length === 0 ? (
        <div className="text-center py-20 text-ink-muted">
          <LayoutGrid size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No photos in the gallery yet.</p>
          <p className="text-xs mt-1">Switch to the Upload tab to add photos.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {photos.map((photo) => {
            const isSelected = selected.has(photo.id);
            return (
              <div key={photo.id}
                className={`relative rounded-xl overflow-hidden group border-2 transition-all duration-200
                  ${isSelected ? "border-red-400 scale-[0.97]" : "border-transparent hover:border-border"}`}
              >
                {/* Checkbox overlay */}
                <button
                  type="button"
                  onClick={() => toggleSelect(photo.id)}
                  className={`absolute top-2 left-2 z-10 w-5 h-5 rounded border-2 flex items-center justify-center transition-all
                  ${isSelected ? "bg-red-500 border-red-500" : "bg-white/80 border-white/60 group-hover:border-white"}`}
                >
                  {isSelected && <CheckCircle2 size={13} className="text-white" />}
                </button>

                {/* Pin to Pinterest Action Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPinModalPhoto(photo);
                  }}
                  className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-red-600 text-white shadow-md hover:bg-red-700 transition-colors"
                  title="Pin to Pinterest SEO Generator"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
                  </svg>
                </button>

                {/* Thumbnail */}
                <div className="relative aspect-square bg-paper-dark" onClick={() => toggleSelect(photo.id)}>
                  <Image src={photo.thumbnail_url || photo.web_image_url} alt={photo.title} fill
                    className="object-cover" sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" />
                </div>

                {/* Info overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                  <p className="text-white text-xs font-medium truncate">{photo.title}</p>
                  {photo.film_simulation && (
                    <p className="text-white/70 text-[10px] truncate">{photo.film_simulation}</p>
                  )}
                </div>

                {/* Selected overlay */}
                {isSelected && (
                  <div className="absolute inset-0 bg-red-500/20 pointer-events-none" />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pinterest Pin Generator Modal */}
      {pinModalPhoto && (
        <PinterestPinModal photo={pinModalPhoto} onClose={() => setPinModalPhoto(null)} />
      )}

      {/* Confirm Delete Dialog */}
      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-paper rounded-2xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-border">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={22} className="text-red-500" />
            </div>
            <h3 className="font-serif text-xl font-semibold text-ink text-center mb-2">Confirm Delete</h3>
            <p className="text-sm text-ink-muted text-center mb-6">
              You are about to <strong className="text-red-500">permanently delete {selected.size} photo{selected.size > 1 ? "s" : ""}</strong> from your gallery and storage. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmOpen(false)}
                className="flex-1 py-2.5 rounded-lg border border-border text-sm font-medium text-ink hover:bg-paper-alt transition-colors">
                Cancel
              </button>
              <button onClick={handleDelete}
                className="flex-1 py-2.5 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors">
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Admin Content ────────────────────────────────────────────────────────
function AdminContent() {
  const [passkey, setPasskey] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passkeyError, setPasskeyError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [activeTab, setActiveTab] = useState<"upload" | "manage">("upload");

  // ── Upload queue state
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadDone, setUploadDone] = useState(false);

  const handleAuthenticate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passkey.trim()) { setPasskeyError("Please enter your admin passkey."); return; }
    setVerifying(true);
    setPasskeyError("");
    try {
      const res = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passkey: passkey.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setIsAuthenticated(true);
      } else {
        setPasskeyError(data.error || "Invalid passkey.");
      }
    } catch {
      setPasskeyError("Verification failed. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  const addFiles = useCallback(async (files: File[]) => {
    const imageFiles = files.filter((f) => f.type.startsWith("image/"));
    if (!imageFiles.length) return;
    const newItems = await Promise.all(imageFiles.map(async (file) => {
      const exif = await extractExif(file);
      return buildQueueItem(file, exif);
    }));
    setQueue((prev) => [...prev, ...newItems]);
    setUploadDone(false);
  }, []);

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = () => setIsDragging(false);
  const onDrop = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); addFiles(Array.from(e.dataTransfer.files)); };
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files) addFiles(Array.from(e.target.files)); e.target.value = ""; };

  const handleFieldChange = (id: string, field: keyof QueueItem, value: string | boolean) => {
    setQueue((prev) => prev.map((item) => item.id === id ? { ...item, [field]: value } : item));
  };
  const handleRemove = (id: string) => {
    setQueue((prev) => { const item = prev.find((i) => i.id === id); if (item) URL.revokeObjectURL(item.previewUrl); return prev.filter((i) => i.id !== id); });
  };

  const handleUploadAll = async () => {
    const pending = queue.filter((i) => i.status === "pending" || i.status === "error");
    if (!pending.length) return;
    setUploading(true);
    setUploadDone(false);

    const { resizeImageToBlob } = await import("@/lib/image-processor");

    for (const item of pending) {
      setQueue((prev) => prev.map((i) => i.id === item.id ? { ...i, status: "uploading", expanded: false } : i));
      try {
        if (!item.title.trim()) throw new Error("Title is required.");

        let uploadedViaR2 = false;

        // ── Try R2 Direct Upload ──
        try {
          const presignRes = await fetch("/api/admin/r2-presign", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-admin-passkey": passkey,
            },
            body: JSON.stringify({
              filename: item.file.name,
              contentType: item.file.type || "image/jpeg",
              size: item.file.size,
            }),
          });

          if (presignRes.ok) {
            const presignData = await presignRes.json();
            const { uploadUrls, publicUrls, keys } = presignData;

            console.log(`[R2 Upload] File: ${item.file.name} | Original size: ${item.file.size} bytes (${(item.file.size / (1024 * 1024)).toFixed(2)} MB)`);

            // Generate web (2560px) and thumbnail (960px) JPEG blobs in browser
            const [webBlob, thumbBlob] = await Promise.all([
              resizeImageToBlob(item.file, 2560, 0.92).catch(() => item.file),
              resizeImageToBlob(item.file, 960, 0.85).catch(() => item.file),
            ]);

            console.log(`[R2 Upload] Web blob: ${webBlob.size} bytes | Thumbnail blob: ${thumbBlob.size} bytes`);

            // Upload 3 tiers directly to Cloudflare R2 (bypasses Vercel body limits)
            const [origRes, webRes, thumbRes] = await Promise.all([
              fetch(uploadUrls.original, { method: "PUT", headers: { "Content-Type": item.file.type || "image/jpeg" }, body: item.file }),
              fetch(uploadUrls.web, { method: "PUT", headers: { "Content-Type": "image/jpeg", "Cache-Control": "public, max-age=31536000, immutable" }, body: webBlob }),
              fetch(uploadUrls.thumbnail, { method: "PUT", headers: { "Content-Type": "image/jpeg", "Cache-Control": "public, max-age=31536000, immutable" }, body: thumbBlob }),
            ]);

            if (!origRes.ok || !webRes.ok || !thumbRes.ok) {
              throw new Error(`R2 direct upload failed. Statuses: Orig ${origRes.status}, Web ${webRes.status}, Thumb ${thumbRes.status}`);
            }

            // Save metadata row to Supabase DB
            const saveRes = await fetch("/api/admin/upload", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-admin-passkey": passkey,
              },
              body: JSON.stringify({
                title: item.title.trim(),
                description: item.description.trim(),
                camera: item.camera.trim(),
                lens: item.lens.trim(),
                film_simulation: item.filmSim,
                iso: item.iso,
                aperture: item.aperture.trim(),
                shutter_speed: item.shutterSpeed.trim(),
                focal_length: item.focalLength.trim(),
                location: item.location.trim(),
                tags: item.tags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean),
                web_image_url: publicUrls.web,
                thumbnail_url: publicUrls.thumbnail,
                original_image_path: keys.original,
              }),
            });

            const saveData = await saveRes.json();
            if (!saveRes.ok) throw new Error(saveData.error || "Failed to save photo metadata.");
            uploadedViaR2 = true;
          }
        } catch (r2Err) {
          console.warn("R2 upload failed or not configured, trying fallback:", r2Err);
        }

        // ── Fallback: Legacy Direct Form Upload ──
        if (!uploadedViaR2) {
          const formData = new FormData();
          formData.append("file", item.file);
          formData.append("title", item.title.trim());
          formData.append("description", item.description.trim());
          formData.append("camera", item.camera.trim());
          formData.append("lens", item.lens.trim());
          formData.append("film_simulation", item.filmSim);
          formData.append("iso", item.iso);
          formData.append("aperture", item.aperture.trim());
          formData.append("shutter_speed", item.shutterSpeed.trim());
          formData.append("focal_length", item.focalLength.trim());
          formData.append("location", item.location.trim());
          formData.append("tags", item.tags.trim());

          const res = await fetch("/api/admin/upload", {
            method: "POST",
            headers: { "x-admin-passkey": passkey },
            body: formData,
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Upload failed.");
        }

        setQueue((prev) => prev.map((i) => i.id === item.id ? { ...i, status: "done" } : i));
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Upload failed.";
        setQueue((prev) => prev.map((i) => i.id === item.id ? { ...i, status: "error", errorMsg: msg, expanded: true } : i));
      }
    }
    setUploading(false);
    setUploadDone(true);
  };

  const totalCount = queue.length;
  const doneCount = queue.filter((i) => i.status === "done").length;
  const errorCount = queue.filter((i) => i.status === "error").length;
  const pendingCount = queue.filter((i) => i.status === "pending").length;
  const hasUploadable = queue.some((i) => i.status === "pending" || i.status === "error");

  return (
    <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
      {/* Page Header */}
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-ink transition-colors mb-2">
          <ArrowLeft size={14} /> Back to Gallery
        </Link>
        <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-ink">Admin Portal</h1>
        <p className="text-sm text-ink-muted mt-1">Upload new photos or manage your existing gallery.</p>
      </div>

      {/* Passkey Gate */}
      {!isAuthenticated ? (
        <div className="glass-card rounded-2xl p-8 sm:p-12 text-center max-w-md mx-auto shadow-lg">
          <div className="w-14 h-14 rounded-full bg-amber-light/40 text-amber-dark flex items-center justify-center mx-auto mb-4">
            <KeyRound size={28} strokeWidth={1.5} />
          </div>
          <h2 className="font-serif text-2xl font-semibold text-ink mb-2">Admin Passcode Required</h2>
          <p className="text-sm text-ink-muted mb-6">Enter your secret admin passkey to access the portal.</p>
          <form onSubmit={handleAuthenticate} className="space-y-4">
            <input type="password" value={passkey} onChange={(e) => setPasskey(e.target.value)} placeholder="Enter passkey" autoFocus
              className="w-full px-4 py-3 rounded-lg border border-border bg-paper-alt/50 text-ink text-sm text-center placeholder:text-ink-muted/50 focus:outline-none focus:border-amber focus:ring-2 focus:ring-amber/20" />
            {passkeyError && <p className="text-xs text-red-500 font-medium">{passkeyError}</p>}
            <button type="submit" disabled={verifying} className="w-full py-3 rounded-lg bg-ink text-paper text-sm font-medium hover:bg-ink-light transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-60">
              {verifying ? <><Loader2 size={16} className="animate-spin" /> Verifying Passkey...</> : "Access Admin Portal"}
            </button>
          </form>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Tab Bar */}
          <div className="flex border-b border-border gap-1">
            {([
              { key: "upload", label: "Upload Photos", icon: Upload },
              { key: "manage", label: "Manage & Delete", icon: Trash2 },
            ] as { key: "upload" | "manage"; label: string; icon: React.ComponentType<{size?: number; className?: string}> }[]).map(({ key, label, icon: Icon }) => (
              <button key={key} onClick={() => setActiveTab(key)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors
                  ${activeTab === key ? "border-ink text-ink" : "border-transparent text-ink-muted hover:text-ink"}`}>
                <Icon size={15} className={activeTab === key && key === "manage" ? "text-red-500" : undefined} />
                {label}
              </button>
            ))}
          </div>

          {/* ── UPLOAD TAB ───────────────────────────────────────── */}
          {activeTab === "upload" && (
            <div className="space-y-6">
              {/* Drop Zone */}
              <div onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer
                  transition-all duration-200 flex flex-col items-center justify-center gap-4
                  ${isDragging ? "border-amber bg-amber-light/15 scale-[1.01]" : "border-border hover:border-amber hover:bg-paper-alt/30"}`}>
                <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={onFileChange} className="hidden" />
                <div className="w-14 h-14 rounded-full bg-paper-dark/50 flex items-center justify-center text-ink-muted">
                  <Images size={28} strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-base font-medium text-ink">{isDragging ? "Release to add photos" : "Drag & drop multiple photos here"}</p>
                  <p className="text-xs text-ink-muted mt-1">Or click to browse — JPG, WebP, PNG, HEIC, RAF supported</p>
                </div>
                {totalCount > 0 && (
                  <span className="text-xs bg-ink text-paper px-3 py-1 rounded-full font-medium">
                    {totalCount} photo{totalCount > 1 ? "s" : ""} in queue — click to add more
                  </span>
                )}
              </div>

              {/* Queue summary */}
              {totalCount > 0 && (
                <div className="glass-card rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-ink font-medium">{totalCount} photo{totalCount > 1 ? "s" : ""}</span>
                    {doneCount > 0 && <span className="text-green-600 font-medium flex items-center gap-1"><CheckCircle2 size={14} />{doneCount} done</span>}
                    {errorCount > 0 && <span className="text-red-500 font-medium flex items-center gap-1"><AlertCircle size={14} />{errorCount} failed</span>}
                    {pendingCount > 0 && <span className="text-ink-muted">{pendingCount} pending</span>}
                  </div>
                  {doneCount > 0 && (
                    <div className="w-full h-1.5 bg-paper-dark rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full transition-all duration-500" style={{ width: `${(doneCount / totalCount) * 100}%` }} />
                    </div>
                  )}
                  <div className="flex items-center gap-2 ml-auto">
                    {uploadDone && doneCount > 0 && (
                      <button onClick={() => setActiveTab("manage")} className="text-xs text-amber-dark hover:underline font-medium">
                        Manage photos →
                      </button>
                    )}
                    <button type="button" onClick={handleUploadAll} disabled={uploading || !hasUploadable}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-ink text-paper font-medium text-sm
                                 hover:bg-ink-light transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm">
                      {uploading ? <><Loader2 size={15} className="animate-spin" /> Uploading...</> : <><Send size={15} /> Publish All</>}
                    </button>
                  </div>
                </div>
              )}

              {/* Cards */}
              {queue.length > 0 && (
                <div className="space-y-3">
                  {queue.map((item, idx) => (
                    <PhotoCard key={item.id} item={item} index={idx} onChange={handleFieldChange} onRemove={handleRemove} />
                  ))}
                </div>
              )}

              {/* Bottom CTA */}
              {totalCount > 0 && (
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <button type="button" onClick={() => { queue.forEach((i) => URL.revokeObjectURL(i.previewUrl)); setQueue([]); setUploadDone(false); }}
                    disabled={uploading} className="text-sm text-ink-muted hover:text-red-500 transition-colors disabled:opacity-40">
                    Clear all
                  </button>
                  <button type="button" onClick={handleUploadAll} disabled={uploading || !hasUploadable}
                    className="flex items-center gap-2 px-8 py-3.5 rounded-full bg-ink text-paper font-medium text-sm
                               hover:bg-ink-light transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md">
                    {uploading
                      ? <><Loader2 size={16} className="animate-spin" /> Uploading {doneCount}/{totalCount}...</>
                      : <><Camera size={16} /> Publish {pendingCount + errorCount} Photo{pendingCount + errorCount !== 1 ? "s" : ""}</>}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── MANAGE TAB ───────────────────────────────────────── */}
          {activeTab === "manage" && <ManagePanel passkey={passkey} />}
        </div>
      )}
    </main>
  );
}

export default function AdminUploadPage() {
  return (
    <div className="flex flex-col min-h-screen bg-paper">
      <Header />
      <Suspense fallback={<div className="flex-1 min-h-[400px]" />}>
        <AdminContent />
      </Suspense>
      <Footer />
    </div>
  );
}
