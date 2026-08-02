"use client";

import { useState, useRef, forwardRef } from "react";
import Image from "next/image";
import {
  Send,
  Loader2,
  Check,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";

function InstagramSVG() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4 text-amber group-hover:scale-110 transition-transform flex-shrink-0"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

const GEAR = [
  { name: "Fujifilm X-T30 II", type: "body" },
  { name: "iPhone 17", type: "body" },
  { name: "XF 18-55mm f/2.8-4 R LM OIS", type: "lens" },
];

/* ── Inline SVG camera body ornament ─────────────────────── */
function CameraBodySVG() {
  return (
    <svg
      viewBox="0 0 80 56"
      fill="none"
      className="w-20 h-14 text-paper/30"
      aria-hidden="true"
    >
      {/* Body */}
      <rect x="4" y="14" width="72" height="38" rx="3" stroke="currentColor" strokeWidth="1.5" />
      {/* Viewfinder hump */}
      <rect x="24" y="4" width="26" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
      {/* Lens circle */}
      <circle cx="40" cy="33" r="14" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="40" cy="33" r="8"  stroke="currentColor" strokeWidth="1.2" />
      <circle cx="40" cy="33" r="3"  fill="currentColor" opacity="0.5" />
      {/* Flash/mode dial */}
      <circle cx="10" cy="22" r="3" stroke="currentColor" strokeWidth="1" />
      {/* Shutter button */}
      <circle cx="62" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

/** Small dot marker for gear list */
function Dot() {
  return (
    <svg viewBox="0 0 8 8" className="w-2 h-2 flex-shrink-0 text-amber" aria-hidden="true">
      <rect x="1" y="1" width="6" height="6" fill="currentColor" />
    </svg>
  );
}

type FormStatus = "idle" | "sending" | "success" | "error";

const ContactCard = forwardRef<HTMLElement>(function ContactCard(_, ref) {
  const [formStatus, setFormStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormStatus("sending");
    setErrorMessage("");

    const data = new FormData(e.currentTarget);
    const body = {
      name: data.get("name") as string,
      email: data.get("email") as string,
      subject: data.get("subject") as string,
      message: data.get("message") as string,
      honeypot: data.get("_hp") as string,
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Something went wrong");
      }

      setFormStatus("success");
      formRef.current?.reset();
      setTimeout(() => setFormStatus("idle"), 5000);
    } catch (err) {
      setFormStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to send message"
      );
    }
  };

  return (
    <section
      ref={ref}
      id="contact"
      className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-16"
    >
      {/* Section kicker */}
      <div className="flex items-center gap-3 mb-8">
        <div className="h-px flex-1 bg-border" />
        <p className="text-[0.65rem] uppercase tracking-[0.2em] text-amber-dark font-semibold font-sans">
          Get in Touch
        </p>
        <div className="h-px flex-1 bg-border" />
      </div>

      {/* Card — flat vector, 2px border, offset shadow */}
      <div
        className="contact-card overflow-hidden grid grid-cols-1 lg:grid-cols-5"
      >
        {/* ─── Left panel: Profile ─── */}
        <div
          className="lg:col-span-2 bg-ink text-paper
                      p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden"
        >
          {/* Background camera ornament */}
          <div className="absolute bottom-4 right-4 pointer-events-none">
            <CameraBodySVG />
          </div>

          <div className="relative z-10">
            {/* Avatar Photo — prominent portrait size */}
            <div className="relative w-32 h-32 sm:w-40 sm:h-40 border-2 border-amber rounded-3xl overflow-hidden mb-6 shadow-xl bg-paper-dark">
              <Image
                src="https://images.stillframes.net/IMG_7203.jpg"
                alt="Abhinav Kumar"
                fill
                className="object-cover object-[50%_35%]"
                sizes="(max-width: 640px) 128px, 160px"
                priority
              />
            </div>

            <h2 className="font-serif text-3xl font-bold italic mb-4">
              Abhinav Kumar
            </h2>
            <p className="text-paper/70 text-sm leading-relaxed mb-4">
              Amateur photographer documenting places, people, and everyday moments. Learning with a Fujifilm.
            </p>

            <a
              href="https://instagram.com/ixel_212"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-sans text-paper/80 hover:text-amber transition-colors mb-8 group"
            >
              <InstagramSVG />
              <span>Connect with me on Instagram <strong className="font-semibold text-amber">@ixel_212</strong></span>
            </a>
          </div>

          {/* Gear list */}
          <div className="relative z-10">
            <p className="text-[0.62rem] uppercase tracking-[0.2em] text-paper/40 mb-3 font-sans font-semibold">
              In My Camera Bag
            </p>
            <div className="flex flex-col gap-1.5">
              {GEAR.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <Dot />
                  <span className="text-xs text-paper/75 font-sans">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── Right panel: Contact Form ─── */}
        <div className="lg:col-span-3 p-8 sm:p-10 bg-paper">
          <h3 className="font-serif text-2xl font-bold text-ink mb-8">
            Send a Message
          </h3>

          <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
            {/* Honeypot (hidden from humans & autofill) */}
            <input
              type="text"
              name="_hp"
              tabIndex={-1}
              autoComplete="new-password"
              style={{ display: "none" }}
              aria-hidden="true"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                name="name"
                label="Name"
                placeholder="Your name"
                required
              />
              <InputField
                name="email"
                label="Email"
                type="email"
                placeholder="you@example.com"
                required
              />
            </div>

            <InputField
              name="subject"
              label="Subject"
              placeholder="What's this about?"
              required
            />

            <div>
              <label
                htmlFor="message"
                className="block text-[0.65rem] font-semibold text-ink-muted mb-1.5 uppercase tracking-[0.12em] font-sans"
              >
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                required
                placeholder="Your message…"
                className="w-full px-3 py-2.5 border border-border bg-paper-alt
                           text-ink text-sm placeholder:text-ink-muted/40 font-sans
                           focus:outline-none focus:border-amber
                           transition-colors duration-150 resize-none"
              />
            </div>

            {/* Submit — flat vector button */}
            <motion.button
              type="submit"
              disabled={formStatus === "sending"}
              className="w-full flex items-center justify-center gap-2 px-6 py-3
                         rounded-full border border-amber bg-amber text-paper
                         text-xs font-semibold uppercase tracking-[0.1em] font-sans
                         hover:bg-amber-dark
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-all duration-150"
              whileTap={{ scale: 0.99 }}
            >
              {formStatus === "sending" ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Sending…
                </>
              ) : formStatus === "success" ? (
                <>
                  <Check size={15} />
                  Message Sent!
                </>
              ) : (
                <>
                  <Send size={15} strokeWidth={2} />
                  Send Message
                </>
              )}
            </motion.button>

            {/* Status messages */}
            {formStatus === "success" && (
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-sage text-center uppercase tracking-[0.1em] font-sans"
              >
                Thank you! I&apos;ll get back to you soon.
              </motion.p>
            )}
            {formStatus === "error" && (
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center gap-1.5 text-xs text-red-500 font-sans"
              >
                <AlertCircle size={13} />
                {errorMessage}
              </motion.p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
});

export default ContactCard;

// ── Reusable input field ──
function InputField({
  name,
  label,
  type = "text",
  placeholder,
  required,
}: {
  name: string;
  label: string;
  type?: string;
  placeholder: string;
  required?: boolean;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="block text-[0.65rem] font-semibold text-ink-muted mb-1.5 uppercase tracking-[0.12em] font-sans"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 border border-border bg-paper-alt
                   text-ink text-sm placeholder:text-ink-muted/40 font-sans
                   focus:outline-none focus:border-ink
                   transition-colors duration-150"
      />
    </div>
  );
}
