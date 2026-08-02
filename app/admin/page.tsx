"use client";

import { useState, useRef, Suspense, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, notFound } from "next/navigation";
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
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { FilmSimulation } from "@/lib/types";

// ─── Constants ────────────────────────────────────────────────────────────────
const FILM_SIMULATIONS: FilmSimulation[] = [
  "Classic Chrome",
  "Velvia/Vivid",
  "ACROS",
  "Classic Neg.",
  "Provia/Standard",
  "PRO Neg. Hi",
  "PRO Neg. Std",
  "Astia/Soft",
  "Eterna",
  "Eterna Bleach Bypass",
  "REALA ACE",
  "Nostalgic Neg.",
];

// ─── Photo Queue Item Type ─────────────────────────────────────────────────────
interface QueueItem {
  id: string;           // local unique id (not UUID)
  file: File;
  previewUrl: string;
  exifParsed: boolean;
  // editable metadata
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
  // upload status
  status: "pending" | "uploading" | "done" | "error";
  errorMsg: string;
  expanded: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

async function extractExif(file: File): Promise<Partial<QueueItem>> {
  try {
    const output = await exifr.parse(file, [
      "Make", "Model", "LensModel", "ISO", "FNumber", "ExposureTime", "FocalLength",
    ]);
    if (!output) return {};
    return {
      exifParsed: true,
      camera: output.Model || "Fujifilm X-T5",
      lens: output.LensModel || "",
      iso: output.ISO ? String(output.ISO) : "",
      aperture: output.FNumber ? `f/${output.FNumber}` : "",
      shutterSpeed: output.ExposureTime
        ? output.ExposureTime < 1
          ? `1/${Math.round(1 / output.ExposureTime)}s`
          : `${output.ExposureTime}s`
        : "",
      focalLength: output.FocalLength ? `${output.FocalLength}mm` : "",
    };
  } catch {
    return {};
  }
}

function buildQueueItem(file: File, exif: Partial<QueueItem>): QueueItem {
  const rawName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
  const title = rawName.charAt(0).toUpperCase() + rawName.slice(1);
  return {
    id: makeId(),
    file,
    previewUrl: URL.createObjectURL(file),
    exifParsed: exif.exifParsed ?? false,
    title,
    description: "",
    camera: exif.camera ?? "Fujifilm X-T5",
    lens: exif.lens ?? "",
    filmSim: "Classic Chrome",
    iso: exif.iso ?? "",
    aperture: exif.aperture ?? "",
    shutterSpeed: exif.shutterSpeed ?? "",
    focalLength: exif.focalLength ?? "",
    location: "",
    tags: "",
    status: "pending",
    errorMsg: "",
    expanded: true,
  };
}

// ─── Photo Queue Card ──────────────────────────────────────────────────────────
function PhotoCard({
  item,
  index,
  onChange,
  onRemove,
}: {
  item: QueueItem;
  index: number;
  onChange: (id: string, field: keyof QueueItem, value: string | boolean) => void;
  onRemove: (id: string) => void;
}) {
  const inp = (field: keyof QueueItem) => ({
    value: item[field] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      onChange(item.id, field, e.target.value),
    disabled: item.status === "uploading" || item.status === "done",
  });

  const statusIcon =
    item.status === "done" ? (
      <CheckCircle2 size={16} className="text-green-600 flex-shrink-0" />
    ) : item.status === "error" ? (
      <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
    ) : item.status === "uploading" ? (
      <Loader2 size={16} className="animate-spin text-amber flex-shrink-0" />
    ) : null;

  const cardBorder =
    item.status === "done"
      ? "border-green-400/50"
      : item.status === "error"
      ? "border-red-400/50"
      : item.status === "uploading"
      ? "border-amber/60"
      : "border-border";

  return (
    <div className={`border-2 ${cardBorder} rounded-2xl overflow-hidden bg-paper transition-all duration-300`}>
      {/* Card Header */}
      <div
        className="flex items-center gap-4 p-4 cursor-pointer select-none hover:bg-paper-alt/30 transition-colors"
        onClick={() => onChange(item.id, "expanded", !item.expanded)}
      >
        {/* Thumbnail */}
        <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 shadow-sm">
          <Image src={item.previewUrl} alt={item.title} fill className="object-cover" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-ink truncate">{item.title || `Photo ${index + 1}`}</p>
          {item.exifParsed && (
            <p className="text-xs text-amber-dark flex items-center gap-1 mt-0.5">
              <Sparkles size={10} /> EXIF auto-extracted
            </p>
          )}
          {item.status === "error" && (
            <p className="text-xs text-red-500 mt-0.5 truncate">{item.errorMsg}</p>
          )}
          {item.status === "done" && (
            <p className="text-xs text-green-600 mt-0.5">Published successfully!</p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {statusIcon}
          {item.status !== "uploading" && item.status !== "done" && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onRemove(item.id); }}
              className="p-1 text-ink-muted hover:text-red-500 transition-colors"
              title="Remove photo"
            >
              <X size={15} />
            </button>
          )}
          {item.expanded ? <ChevronUp size={16} className="text-ink-muted" /> : <ChevronDown size={16} className="text-ink-muted" />}
        </div>
      </div>

      {/* Expanded Fields */}
      {item.expanded && (
        <div className="border-t border-border p-4 space-y-4">
          {/* Title + Description */}
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

          {/* EXIF / Camera Specs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-ink-muted uppercase tracking-widest mb-1">Camera</label>
              <input type="text" {...inp("camera")} className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-paper-alt/50 text-ink focus:outline-none focus:border-amber" />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-ink-muted uppercase tracking-widest mb-1">Lens</label>
              <input type="text" {...inp("lens")} placeholder="XF 35mm f/1.4 R" className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-paper-alt/50 text-ink focus:outline-none focus:border-amber" />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-ink-muted uppercase tracking-widest mb-1">ISO</label>
              <input type="number" {...inp("iso")} placeholder="160" className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-paper-alt/50 text-ink focus:outline-none focus:border-amber" />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-ink-muted uppercase tracking-widest mb-1">Aperture</label>
              <input type="text" {...inp("aperture")} placeholder="f/1.4" className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-paper-alt/50 text-ink focus:outline-none focus:border-amber" />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-ink-muted uppercase tracking-widest mb-1">Shutter</label>
              <input type="text" {...inp("shutterSpeed")} placeholder="1/250s" className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-paper-alt/50 text-ink focus:outline-none focus:border-amber" />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-ink-muted uppercase tracking-widest mb-1">Focal Length</label>
              <input type="text" {...inp("focalLength")} placeholder="35mm" className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-paper-alt/50 text-ink focus:outline-none focus:border-amber" />
            </div>
          </div>

          {/* Film Sim + Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-ink-muted uppercase tracking-widest mb-1">Film Simulation</label>
              <select {...inp("filmSim")}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-paper-alt/50 text-ink focus:outline-none focus:border-amber cursor-pointer">
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

// ─── Main Admin Content ────────────────────────────────────────────────────────
function AdminContent() {
  const searchParams = useSearchParams();
  const secretKey = searchParams.get("key");
  const validSecret = process.env.NEXT_PUBLIC_ADMIN_SECRET_KEY || "fuji2026";

  if (secretKey !== validSecret) notFound();

  // ── Auth
  const [passkey, setPasskey] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passkeyError, setPasskeyError] = useState("");

  // ── Queue
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Upload state
  const [uploading, setUploading] = useState(false);
  const [uploadDone, setUploadDone] = useState(false);

  // ── Auth
  const handleAuthenticate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passkey.trim()) { setPasskeyError("Please enter your admin passkey."); return; }
    if (passkey !== validSecret) { setPasskeyError("Invalid passkey."); return; }
    setIsAuthenticated(true);
    setPasskeyError("");
  };

  // ── Add files to queue
  const addFiles = useCallback(async (files: File[]) => {
    const imageFiles = files.filter((f) => f.type.startsWith("image/"));
    if (!imageFiles.length) return;

    const newItems = await Promise.all(
      imageFiles.map(async (file) => {
        const exif = await extractExif(file);
        return buildQueueItem(file, exif);
      })
    );

    setQueue((prev) => [...prev, ...newItems]);
    setUploadDone(false);
  }, []);

  // ── Drag & Drop
  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = () => setIsDragging(false);
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(Array.from(e.dataTransfer.files));
  };
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(Array.from(e.target.files));
    e.target.value = "";
  };

  // ── Field change
  const handleFieldChange = (id: string, field: keyof QueueItem, value: string | boolean) => {
    setQueue((prev) => prev.map((item) => item.id === id ? { ...item, [field]: value } : item));
  };

  // ── Remove
  const handleRemove = (id: string) => {
    setQueue((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((i) => i.id !== id);
    });
  };

  // ── Upload all
  const handleUploadAll = async () => {
    const pending = queue.filter((i) => i.status === "pending" || i.status === "error");
    if (!pending.length) return;

    setUploading(true);
    setUploadDone(false);

    for (const item of pending) {
      // Mark uploading
      setQueue((prev) => prev.map((i) => i.id === item.id ? { ...i, status: "uploading", expanded: false } : i));

      try {
        if (!item.title.trim()) throw new Error("Title is required.");

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
          headers: { "x-admin-passkey": passkey || validSecret },
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Upload failed.");

        setQueue((prev) => prev.map((i) => i.id === item.id ? { ...i, status: "done" } : i));
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Upload failed.";
        setQueue((prev) => prev.map((i) => i.id === item.id ? { ...i, status: "error", errorMsg: msg, expanded: true } : i));
      }
    }

    setUploading(false);
    setUploadDone(true);
  };

  // ── Stats
  const totalCount = queue.length;
  const doneCount = queue.filter((i) => i.status === "done").length;
  const errorCount = queue.filter((i) => i.status === "error").length;
  const pendingCount = queue.filter((i) => i.status === "pending").length;
  const hasUploadable = queue.some((i) => i.status === "pending" || i.status === "error");

  return (
    <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-ink transition-colors mb-2">
            <ArrowLeft size={14} /> Back to Gallery
          </Link>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-ink">Bulk Upload</h1>
          <p className="text-sm text-ink-muted mt-1">
            Drop multiple photos at once — EXIF is extracted automatically for each.
          </p>
        </div>
      </div>

      {/* Passkey Gate */}
      {!isAuthenticated ? (
        <div className="glass-card rounded-2xl p-8 sm:p-12 text-center max-w-md mx-auto shadow-lg">
          <div className="w-14 h-14 rounded-full bg-amber-light/40 text-amber-dark flex items-center justify-center mx-auto mb-4">
            <KeyRound size={28} strokeWidth={1.5} />
          </div>
          <h2 className="font-serif text-2xl font-semibold text-ink mb-2">Admin Passcode Required</h2>
          <p className="text-sm text-ink-muted mb-6">Enter your secret admin passkey to access photo uploading.</p>
          <form onSubmit={handleAuthenticate} className="space-y-4">
            <input
              type="password"
              value={passkey}
              onChange={(e) => setPasskey(e.target.value)}
              placeholder="Enter passkey"
              autoFocus
              className="w-full px-4 py-3 rounded-lg border border-border bg-paper-alt/50 text-ink text-sm text-center placeholder:text-ink-muted/50 focus:outline-none focus:border-amber focus:ring-2 focus:ring-amber/20"
            />
            {passkeyError && <p className="text-xs text-red-500 font-medium">{passkeyError}</p>}
            <button type="submit" className="w-full py-3 rounded-lg bg-ink text-paper text-sm font-medium hover:bg-ink-light transition-colors duration-200">
              Access Admin Portal
            </button>
          </form>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Drop Zone */}
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`
              border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer
              transition-all duration-200 flex flex-col items-center justify-center gap-4
              ${isDragging ? "border-amber bg-amber-light/15 scale-[1.01]" : "border-border hover:border-amber hover:bg-paper-alt/30"}
            `}
          >
            <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={onFileChange} className="hidden" />
            <div className="w-14 h-14 rounded-full bg-paper-dark/50 flex items-center justify-center text-ink-muted">
              <Images size={28} strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-base font-medium text-ink">
                {isDragging ? "Release to add photos" : "Drag & drop multiple photos here"}
              </p>
              <p className="text-xs text-ink-muted mt-1">Or click to browse — JPG, WebP, PNG, HEIC, RAF supported</p>
            </div>
            {totalCount > 0 && (
              <span className="text-xs bg-ink text-paper px-3 py-1 rounded-full font-medium">
                {totalCount} photo{totalCount > 1 ? "s" : ""} in queue — click to add more
              </span>
            )}
          </div>

          {/* Progress Summary Bar */}
          {totalCount > 0 && (
            <div className="glass-card rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-4 text-sm">
                <span className="text-ink font-medium">{totalCount} photo{totalCount > 1 ? "s" : ""}</span>
                {doneCount > 0 && <span className="text-green-600 font-medium flex items-center gap-1"><CheckCircle2 size={14} />{doneCount} done</span>}
                {errorCount > 0 && <span className="text-red-500 font-medium flex items-center gap-1"><AlertCircle size={14} />{errorCount} failed</span>}
                {pendingCount > 0 && <span className="text-ink-muted">{pendingCount} pending</span>}
              </div>

              {/* Progress bar */}
              {doneCount > 0 && (
                <div className="w-full h-1.5 bg-paper-dark rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all duration-500"
                    style={{ width: `${(doneCount / totalCount) * 100}%` }}
                  />
                </div>
              )}

              <div className="flex items-center gap-2 ml-auto">
                {uploadDone && doneCount > 0 && (
                  <Link href="/" className="text-xs text-amber-dark hover:underline font-medium">
                    View live gallery →
                  </Link>
                )}
                <button
                  type="button"
                  onClick={handleUploadAll}
                  disabled={uploading || !hasUploadable}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-ink text-paper font-medium text-sm
                             hover:bg-ink-light transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {uploading ? (
                    <><Loader2 size={15} className="animate-spin" /> Uploading...</>
                  ) : (
                    <><Send size={15} /> Publish All</>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Photo Cards Queue */}
          {queue.length > 0 && (
            <div className="space-y-3">
              {queue.map((item, idx) => (
                <PhotoCard
                  key={item.id}
                  item={item}
                  index={idx}
                  onChange={handleFieldChange}
                  onRemove={handleRemove}
                />
              ))}
            </div>
          )}

          {/* Upload all — sticky bottom CTA */}
          {totalCount > 0 && (
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => {
                  queue.forEach((i) => URL.revokeObjectURL(i.previewUrl));
                  setQueue([]);
                  setUploadDone(false);
                }}
                disabled={uploading}
                className="text-sm text-ink-muted hover:text-red-500 transition-colors disabled:opacity-40"
              >
                Clear all
              </button>
              <button
                type="button"
                onClick={handleUploadAll}
                disabled={uploading || !hasUploadable}
                className="flex items-center gap-2 px-8 py-3.5 rounded-full bg-ink text-paper
                           font-medium text-sm hover:bg-ink-light transition-all duration-200
                           disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                {uploading ? (
                  <><Loader2 size={16} className="animate-spin" /> Uploading {doneCount}/{totalCount}...</>
                ) : (
                  <><Camera size={16} /> Publish {hasUploadable ? pendingCount + errorCount : 0} Photo{pendingCount + errorCount !== 1 ? "s" : ""}</>
                )}
              </button>
            </div>
          )}
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
