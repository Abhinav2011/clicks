"use client";

import { useState, useRef, ChangeEvent, Suspense } from "react";
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
  Image as ImageIcon,
  Tag,
  Sliders,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { FilmSimulation } from "@/lib/types";

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

function AdminContent() {
  // ── Secret URL Gate ──
  const searchParams = useSearchParams();
  const secretKey = searchParams.get("key");
  const validSecret = process.env.NEXT_PUBLIC_ADMIN_SECRET_KEY || "fuji2026";

  // If secret key in URL is missing or incorrect, render 404 Not Found!
  if (secretKey !== validSecret) {
    notFound();
  }

  const [passkey, setPasskey] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passkeyError, setPasskeyError] = useState("");

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [exifParsed, setExifParsed] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [camera, setCamera] = useState("Fujifilm X-T5");
  const [lens, setLens] = useState("XF 35mm f/1.4 R");
  const [filmSim, setFilmSim] = useState<FilmSimulation>("Classic Chrome");
  const [iso, setIso] = useState("");
  const [aperture, setAperture] = useState("f/1.4");
  const [shutterSpeed, setShutterSpeed] = useState("1/250s");
  const [focalLength, setFocalLength] = useState("35mm");
  const [location, setLocation] = useState("");
  const [tags, setTags] = useState("street, fuji, classic chrome");

  const [uploading, setUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Passkey Verification ──
  const handleAuthenticate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passkey.trim()) {
      setPasskeyError("Please enter your admin passkey.");
      return;
    }
    if (passkey !== validSecret) {
      setPasskeyError("Invalid passkey.");
      return;
    }
    setIsAuthenticated(true);
    setPasskeyError("");
  };

  // ── File Selection & EXIF Extraction ──
  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
    setStatusMessage(null);

    const rawName = selectedFile.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
    const formattedTitle = rawName.charAt(0).toUpperCase() + rawName.slice(1);
    if (!title) setTitle(formattedTitle);

    try {
      const output = await exifr.parse(selectedFile, [
        "Make",
        "Model",
        "LensModel",
        "ISO",
        "FNumber",
        "ExposureTime",
        "FocalLength",
      ]);

      if (output) {
        setExifParsed(true);
        if (output.Model) setCamera(output.Model);
        if (output.LensModel) setLens(output.LensModel);
        if (output.ISO) setIso(String(output.ISO));
        if (output.FNumber) setAperture(`f/${output.FNumber}`);
        if (output.ExposureTime) {
          const exp = output.ExposureTime;
          setShutterSpeed(exp < 1 ? `1/${Math.round(1 / exp)}s` : `${exp}s`);
        }
        if (output.FocalLength) setFocalLength(`${output.FocalLength}mm`);
      }
    } catch (err) {
      console.log("No EXIF metadata extracted, manual input available.", err);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  // ── Submit Photo Upload ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setStatusMessage({ type: "error", text: "Please select or drop an image file first." });
      return;
    }

    setUploading(true);
    setStatusMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title);
      formData.append("description", description);
      formData.append("camera", camera);
      formData.append("lens", lens);
      formData.append("film_simulation", filmSim);
      formData.append("iso", iso);
      formData.append("aperture", aperture);
      formData.append("shutter_speed", shutterSpeed);
      formData.append("focal_length", focalLength);
      formData.append("location", location);
      formData.append("tags", tags);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: {
          "x-admin-passkey": passkey || validSecret,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to upload photo.");
      }

      setStatusMessage({
        type: "success",
        text: `"${title}" has been published successfully! It is now the latest photo on your website.`,
      });

      setFile(null);
      setPreviewUrl(null);
      setTitle("");
      setDescription("");
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Upload failed.",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
      {/* Top title */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-ink transition-colors mb-2"
          >
            <ArrowLeft size={14} /> Back to Gallery
          </Link>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-ink">
            Upload New Click
          </h1>
          <p className="text-sm text-ink-muted mt-1">
            Add your latest Fujifilm photo to the showcase gallery.
          </p>
        </div>
      </div>

      {/* Gate: Passkey Authentication Prompt */}
      {!isAuthenticated ? (
        <div className="glass-card rounded-2xl p-8 sm:p-12 text-center max-w-md mx-auto shadow-lg">
          <div className="w-14 h-14 rounded-full bg-amber-light/40 text-amber-dark flex items-center justify-center mx-auto mb-4">
            <KeyRound size={28} strokeWidth={1.5} />
          </div>
          <h2 className="font-serif text-2xl font-semibold text-ink mb-2">
            Admin Passcode Required
          </h2>
          <p className="text-sm text-ink-muted mb-6">
            Enter your secret admin passkey to access photo uploading.
          </p>

          <form onSubmit={handleAuthenticate} className="space-y-4">
            <input
              type="password"
              value={passkey}
              onChange={(e) => setPasskey(e.target.value)}
              placeholder="Enter passkey"
              className="w-full px-4 py-3 rounded-lg border border-border bg-paper-alt/50
                         text-ink text-sm text-center placeholder:text-ink-muted/50
                         focus:outline-none focus:border-amber focus:ring-2 focus:ring-amber/20"
              autoFocus
            />

            {passkeyError && (
              <p className="text-xs text-red-500 font-medium">{passkeyError}</p>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-ink text-paper text-sm font-medium
                         hover:bg-ink-light transition-colors duration-200"
            >
              Access Admin Portal
            </button>
          </form>
        </div>
      ) : (
        /* Main Admin Upload Form */
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 1. Drag & Drop File Zone */}
          <div className="glass-card rounded-2xl p-6 sm:p-8">
            <h2 className="font-serif text-xl font-semibold text-ink mb-4 flex items-center gap-2">
              <ImageIcon size={20} className="text-amber" /> 1. Drop Photo File
            </h2>

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`
                relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
                transition-all duration-200 flex flex-col items-center justify-center min-h-[220px]
                ${
                  previewUrl
                    ? "border-amber/60 bg-amber-light/10"
                    : "border-border hover:border-amber hover:bg-paper-alt/40"
                }
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={onFileChange}
                className="hidden"
              />

              {previewUrl ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="relative w-48 h-36 rounded-lg overflow-hidden shadow-md">
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <p className="text-xs text-ink font-medium">
                    {file?.name} ({(file!.size / (1024 * 1024)).toFixed(2)} MB)
                  </p>
                  <button
                    type="button"
                    className="text-xs text-amber-dark hover:underline font-medium"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                  >
                    Click to replace photo
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-paper-dark/50 flex items-center justify-center text-ink-muted">
                    <Upload size={24} strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ink">
                      Drag and drop your Fujifilm photo here
                    </p>
                    <p className="text-xs text-ink-muted mt-1">
                      Supports JPG, WebP, PNG, and high-res files
                    </p>
                  </div>
                </div>
              )}
            </div>

            {exifParsed && (
              <div className="mt-3 flex items-center gap-1.5 text-xs text-sage font-medium">
                <Sparkles size={14} /> EXIF camera metadata auto-extracted from file!
              </div>
            )}
          </div>

          {/* 2. Photo Title & Story */}
          <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-4">
            <h2 className="font-serif text-xl font-semibold text-ink mb-2 flex items-center gap-2">
              <Tag size={20} className="text-amber" /> 2. Title & Story
            </h2>

            <div>
              <label className="block text-xs font-medium text-ink-muted uppercase tracking-wider mb-1">
                Photo Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Rainy Evening in Kyoto"
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-paper-alt/50
                           text-ink text-sm placeholder:text-ink-muted/50
                           focus:outline-none focus:border-amber focus:ring-2 focus:ring-amber/20"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-ink-muted uppercase tracking-wider mb-1">
                Story / Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell a brief story about this click..."
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-paper-alt/50
                           text-ink text-sm placeholder:text-ink-muted/50
                           focus:outline-none focus:border-amber focus:ring-2 focus:ring-amber/20 resize-none"
              />
            </div>
          </div>

          {/* 3. Fujifilm EXIF & Recipe Specs */}
          <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-4">
            <h2 className="font-serif text-xl font-semibold text-ink mb-2 flex items-center gap-2">
              <Sliders size={20} className="text-amber" /> 3. Fuji Specs & Metadata
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-ink-muted uppercase tracking-wider mb-1">
                  Camera Model
                </label>
                <input
                  type="text"
                  value={camera}
                  onChange={(e) => setCamera(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-paper-alt/50
                             text-ink text-sm focus:outline-none focus:border-amber"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-ink-muted uppercase tracking-wider mb-1">
                  Lens Model
                </label>
                <input
                  type="text"
                  value={lens}
                  onChange={(e) => setLens(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-paper-alt/50
                             text-ink text-sm focus:outline-none focus:border-amber"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-ink-muted uppercase tracking-wider mb-1">
                Film Simulation Recipe
              </label>
              <select
                value={filmSim}
                onChange={(e) => setFilmSim(e.target.value as FilmSimulation)}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-paper-alt/50
                           text-ink text-sm focus:outline-none focus:border-amber cursor-pointer"
              >
                {FILM_SIMULATIONS.map((sim) => (
                  <option key={sim} value={sim}>
                    {sim}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-ink-muted uppercase tracking-wider mb-1">
                  ISO
                </label>
                <input
                  type="number"
                  value={iso}
                  onChange={(e) => setIso(e.target.value)}
                  placeholder="e.g. 160"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-paper-alt/50
                             text-ink text-sm focus:outline-none focus:border-amber"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-ink-muted uppercase tracking-wider mb-1">
                  Aperture
                </label>
                <input
                  type="text"
                  value={aperture}
                  onChange={(e) => setAperture(e.target.value)}
                  placeholder="f/1.4"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-paper-alt/50
                             text-ink text-sm focus:outline-none focus:border-amber"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-ink-muted uppercase tracking-wider mb-1">
                  Shutter
                </label>
                <input
                  type="text"
                  value={shutterSpeed}
                  onChange={(e) => setShutterSpeed(e.target.value)}
                  placeholder="1/250s"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-paper-alt/50
                             text-ink text-sm focus:outline-none focus:border-amber"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-ink-muted uppercase tracking-wider mb-1">
                  Focal Length
                </label>
                <input
                  type="text"
                  value={focalLength}
                  onChange={(e) => setFocalLength(e.target.value)}
                  placeholder="35mm"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-paper-alt/50
                             text-ink text-sm focus:outline-none focus:border-amber"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-ink-muted uppercase tracking-wider mb-1">
                  Location (Optional)
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Tokyo, Japan"
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-paper-alt/50
                             text-ink text-sm focus:outline-none focus:border-amber"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-ink-muted uppercase tracking-wider mb-1">
                  Tags (Comma Separated)
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="street, night, classic chrome"
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-paper-alt/50
                             text-ink text-sm focus:outline-none focus:border-amber"
                />
              </div>
            </div>
          </div>

          {/* Status Feedback */}
          {statusMessage && (
            <div
              className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${
                statusMessage.type === "success"
                  ? "bg-sage-light/30 text-sage"
                  : "bg-red-500/10 text-red-500"
              }`}
            >
              {statusMessage.type === "success" ? (
                <CheckCircle2 size={18} />
              ) : (
                <AlertCircle size={18} />
              )}
              {statusMessage.text}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex items-center justify-between pt-2">
            <Link
              href="/"
              className="text-sm font-medium text-ink-muted hover:text-ink transition-colors"
            >
              View Live Gallery
            </Link>

            <button
              type="submit"
              disabled={uploading || !file}
              className="flex items-center gap-2 px-8 py-3.5 rounded-full bg-ink text-paper
                         font-medium text-sm hover:bg-ink-light transition-all duration-200
                         disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              {uploading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Uploading & Publishing...
                </>
              ) : (
                <>
                  <Camera size={16} /> Publish New Click
                </>
              )}
            </button>
          </div>
        </form>
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
