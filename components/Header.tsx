"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Camera } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const links = [
    { href: "/", label: "01. ARCHIVE" },
    { href: "/contact", label: "02. SAY HELLO" },
  ];

  return (
    <header className="site-header">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="header-row">
          <Link href="/" className="brand" aria-label="Still Frames Home">
            <span className="brand-mark">
              <Camera size={20} strokeWidth={2.2} />
            </span>
            <div className="flex flex-col">
              <span className="brand-text-title">STILL FRAMES</span>
            </div>
            <span className="brand-stamp hidden sm:inline-block">VOL. 2026</span>
          </Link>

          <nav className="hidden md:flex nav-links">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link-btn ${pathname === link.href ? "active" : ""}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <span className="header-note hidden lg:inline-block">
            📷 FUJIFILM PHOTO DIARY
          </span>

          <button
            className="md:hidden menu-button"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mobile-nav"
          >
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

