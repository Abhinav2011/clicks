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
    { href: "/", label: "Archive" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <header className="site-header">
      <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-10">
        <div className="header-row">
          <Link href="/" className="brand" aria-label="Still Frames Home">
            <span className="brand-mark">
              <Camera size={18} strokeWidth={2.2} />
            </span>
            <span className="brand-text-title">STILL FRAMES</span>
          </Link>

          {/* Desktop Nav Links */}
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
            Fujifilm Photo Diary
          </span>

          {/* Mobile Hamburger Toggle */}
          <button
            className="md:hidden menu-button p-2 text-ink hover:bg-paper-alt rounded-lg transition-colors ml-auto"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mobile-nav border-t border-border bg-paper-card"
          >
            <div className="flex flex-col py-2 px-4 gap-1">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`mobile-nav-link ${pathname === link.href ? "mobile-nav-link--active" : ""}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

