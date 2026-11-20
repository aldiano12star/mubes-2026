import React from "react";
import { MapPin, Radio } from "lucide-react";

export function WebFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-edge bg-surface-alt mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-ink-muted">
        {/* Penyelenggara */}
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-center sm:text-left">
          <span className="font-display font-bold uppercase tracking-wider text-ink text-sm">
            Saba ExploIT
          </span>
          <span className="hidden sm:inline text-ink-subtle">•</span>
          <span className="text-ink-muted">
            SMA Negeri 1 Bantul (<span className="text-brand font-mono">@sabaexploit</span>)
          </span>
        </div>

        {/* Lokasi & Status */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 font-mono text-[11px] text-ink-subtle">
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-brand" />
            <span>Ruang Yudistira</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Radio className="h-3.5 w-3.5 shrink-0 text-status-ok" />
            <span>MUBES 2026 • PROTOCOL: VALORANT</span>
          </div>
        </div>

        {/* Hak Cipta */}
        <div className="text-center md:text-right text-[11px] text-ink-subtle font-mono">
          &copy; {currentYear} Saba ExploIT. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
