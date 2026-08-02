"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Camera, Menu, X, Mail, Grid } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "Gallery", icon: Grid },
    { href: "/contact", label: "Contact", icon: Mail },
  ];

  return (
    <header className="sticky top-0 z-40 glass-card border-b border-border-subtle">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Brand */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group"
          >
            <Camera
              size={22}
              className="text-amber transition-colors group-hover:text-amber-dark"
              strokeWidth={1.5}
            />
            <span className="font-serif text-xl tracking-wide text-ink font-semibold">
              Clicks
            </span>
            <span className="hidden sm:inline text-[0.65rem] uppercase tracking-[0.2em] text-ink-muted font-sans mt-0.5">
              Fuji Gallery
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`
                    flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium
                    transition-all duration-200
                    ${
                      isActive
                        ? "bg-ink text-paper shadow-sm"
                        : "text-ink-muted hover:text-ink hover:bg-paper-dark/60"
                    }
                  `}
                >
                  <Icon size={14} strokeWidth={1.8} />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Mobile Hamburger Button */}
          <button
            className="md:hidden p-2 text-ink-muted hover:text-ink transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden border-t border-border-subtle bg-paper/95 backdrop-blur-md"
          >
            <div className="px-4 py-3 flex flex-col gap-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`
                      flex items-center gap-2.5 px-4 py-2 rounded-lg text-sm font-medium
                      transition-all duration-200
                      ${
                        isActive
                          ? "bg-ink text-paper"
                          : "text-ink-muted hover:text-ink hover:bg-paper-dark/50"
                      }
                    `}
                  >
                    <Icon size={16} strokeWidth={1.8} />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
