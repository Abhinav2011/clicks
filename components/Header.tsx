"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Aperture } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function Header() {
  const [open, setOpen] = useState(false); const pathname = usePathname();
  const links = [{ href: "/", label: "Archive" }, { href: "/contact", label: "Say hello" }];
  return <header className="site-header"><div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10"><div className="header-row"><Link href="/" className="brand"><span className="brand-mark"><Aperture size={21} /></span><span>STILL FRAMES<sup>©</sup></span></Link><nav className="hidden md:flex nav-links">{links.map((link) => <Link key={link.href} href={link.href} className={pathname === link.href ? "active" : ""}>{link.label}</Link>)}</nav><span className="header-note hidden sm:block">FUJIFILM PHOTO DIARY</span><button className="md:hidden menu-button" onClick={() => setOpen(!open)} aria-label="Toggle menu">{open ? <X /> : <Menu />}</button></div></div><AnimatePresence>{open && <motion.nav initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="mobile-nav">{links.map((link) => <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>{link.label}</Link>)}</motion.nav>}</AnimatePresence></header>;
}
