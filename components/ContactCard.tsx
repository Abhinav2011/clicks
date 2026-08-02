"use client";

import { useState, useRef, forwardRef } from "react";
import {
  User,
  Send,
  Camera,
  Loader2,
  Check,
  AlertCircle,
  Globe,
  Code2,
  Mail,
} from "lucide-react";
import { motion } from "framer-motion";

const GEAR = [
  { name: "Fujifilm X-T5", type: "body" },
  { name: "XF 35mm f/1.4 R", type: "lens" },
  { name: "XF 23mm f/1.4 R LM WR", type: "lens" },
  { name: "XF 56mm f/1.2 R", type: "lens" },
  { name: "XF 18-55mm f/2.8-4", type: "lens" },
];

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
      className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-20"
    >
      <div
        className="glass-card rounded-2xl overflow-hidden shadow-lg
                    grid grid-cols-1 lg:grid-cols-5"
      >
        {/* ─── Left: Profile ─── */}
        <div
          className="lg:col-span-2 bg-gradient-to-br from-ink to-ink-light
                      text-paper p-8 sm:p-10 flex flex-col justify-between"
        >
          <div>
            {/* Avatar */}
            <div
              className="w-20 h-20 rounded-full bg-gradient-to-br from-amber to-amber-dark
                          flex items-center justify-center mb-6 shadow-lg"
            >
              <User size={32} className="text-paper" strokeWidth={1.5} />
            </div>

            <h2 className="font-serif text-3xl font-semibold mb-2">
              Abhinav Kumar
            </h2>
            <p className="text-paper/70 text-sm leading-relaxed mb-6">
              Photographer & developer. I capture moments through Fujifilm glass
              — street scenes, landscapes, and quiet everyday beauty.
              Film simulations are my darkroom.
            </p>

            {/* Social links */}
            <div className="flex gap-3 mb-8">
              {[
                { icon: Globe, href: "#", label: "Website" },
                { icon: Code2, href: "#", label: "GitHub" },
                { icon: Mail, href: "mailto:hello@example.com", label: "Email" },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="p-2.5 rounded-full bg-white/10 hover:bg-white/20
                             transition-colors duration-200"
                >
                  <Icon size={16} strokeWidth={1.5} />
                </a>
              ))}
            </div>
          </div>

          {/* Gear */}
          <div>
            <p className="text-[0.65rem] uppercase tracking-widest text-paper/50 mb-3 font-medium">
              In My Camera Bag
            </p>
            <div className="flex flex-col gap-2">
              {GEAR.map((item) => (
                <div key={item.name} className="flex items-center gap-2.5">
                  <Camera
                    size={13}
                    className="text-amber flex-shrink-0"
                    strokeWidth={1.5}
                  />
                  <span className="text-sm text-paper/80">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── Right: Contact Form ─── */}
        <div className="lg:col-span-3 p-8 sm:p-10">
          <h3 className="font-serif text-2xl font-semibold text-ink mb-1">
            Get in Touch
          </h3>
          <p className="text-sm text-ink-muted mb-8">
            Have a question, want a print, or just want to say hello?
            Drop me a line.
          </p>

          <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
            {/* Honeypot (hidden) */}
            <input
              type="text"
              name="_hp"
              tabIndex={-1}
              autoComplete="off"
              className="absolute opacity-0 h-0 w-0 pointer-events-none"
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
                className="block text-xs font-medium text-ink-muted mb-1.5 uppercase tracking-wider"
              >
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                required
                placeholder="Your message…"
                className="w-full px-4 py-3 rounded-lg border border-border bg-paper-alt/50
                           text-ink text-sm placeholder:text-ink-muted/50
                           focus:outline-none focus:border-amber focus:ring-2 focus:ring-amber/20
                           transition-all duration-200 resize-none"
              />
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={formStatus === "sending"}
              className="w-full flex items-center justify-center gap-2 px-6 py-3
                         rounded-lg bg-ink text-paper text-sm font-medium
                         hover:bg-ink-light disabled:opacity-60 disabled:cursor-not-allowed
                         transition-colors duration-200"
              whileTap={{ scale: 0.98 }}
            >
              {formStatus === "sending" ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Sending…
                </>
              ) : formStatus === "success" ? (
                <>
                  <Check size={16} />
                  Message Sent!
                </>
              ) : (
                <>
                  <Send size={16} strokeWidth={1.8} />
                  Send Message
                </>
              )}
            </motion.button>

            {/* Status messages */}
            {formStatus === "success" && (
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-sage text-center"
              >
                Thank you! I&apos;ll get back to you soon.
              </motion.p>
            )}
            {formStatus === "error" && (
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center gap-1.5 text-sm text-red-500"
              >
                <AlertCircle size={14} />
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
        className="block text-xs font-medium text-ink-muted mb-1.5 uppercase tracking-wider"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-lg border border-border bg-paper-alt/50
                   text-ink text-sm placeholder:text-ink-muted/50
                   focus:outline-none focus:border-amber focus:ring-2 focus:ring-amber/20
                   transition-all duration-200"
      />
    </div>
  );
}
