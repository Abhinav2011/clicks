import { Camera, Mail, Heart } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 py-12">
        <div className="footer-top">
          <div>
            <p className="footer-kicker">📍 END OF ROLL</p>
            <h2>
              Shot slowly with <span>memory & film.</span>
            </h2>
          </div>
          <Link href="/contact" className="footer-link-btn">
            <Mail size={16} /> Drop a note in the inbox
          </Link>
        </div>

        <div className="footer-bottom">
          <div className="flex items-center gap-2">
            <Camera size={16} className="text-terracotta" />
            <span className="font-serif font-bold text-ink">STILL FRAMES</span>
            <span className="text-[0.62rem] text-ink-muted">· Fujifilm Photo Diary</span>
          </div>

          <div className="flex items-center gap-1 text-ink-muted">
            Handcrafted with <Heart size={12} className="text-terracotta inline mx-0.5" /> in 2026
          </div>

          <div className="text-ink-muted">
            EST. 2024 · ALL RIGHTS RESERVED
          </div>
        </div>
      </div>
    </footer>
  );
}

