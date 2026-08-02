import { Camera, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border-subtle bg-paper-alt/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-2 text-ink-muted">
            <Camera size={16} strokeWidth={1.5} />
            <span className="font-serif text-sm">Clicks</span>
            <span className="text-xs">
              © {new Date().getFullYear()}
            </span>
          </div>

          {/* Made with love */}
          <p className="flex items-center gap-1 text-xs text-ink-muted">
            Made with
            <Heart size={12} className="text-amber fill-amber" />
            and a Fujifilm
          </p>
        </div>
      </div>
    </footer>
  );
}
