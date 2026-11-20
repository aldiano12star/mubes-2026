"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useIsModalOpen } from "@/hooks/useBodyScrollLock";
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  Settings,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number | string }>;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Proyek",
    href: "/proyek",
    icon: FolderKanban,
  },
  {
    label: "Laporan",
    href: "/laporan",
    icon: FileText,
  },
  {
    label: "Pengaturan",
    href: "/pengaturan",
    icon: Settings,
  },
];

export function AppBottomNav() {
  const pathname = usePathname();
  const isModalActive = useIsModalOpen();

  const activeIndex = NAV_ITEMS.findIndex((item) => pathname === item.href);
  const resolvedIndex = activeIndex === -1 ? 0 : activeIndex;

  return (
    <nav
      data-nav="true"
      aria-label="Navigasi Utama Bawah"
      className={`fixed bottom-5 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-[380px] rounded-full bg-surface-overlay backdrop-blur-2xl border border-edge shadow-lg md:hidden p-1.5 transition-all duration-300 ease-out select-none ${
        isModalActive
          ? "translate-y-28 opacity-0 pointer-events-none"
          : "translate-y-0 opacity-100 pointer-events-auto"
      }`}
    >
      <div className="relative flex items-center justify-between w-full">
        {/* Sliding active lens indicator */}
        <div
          className="absolute top-0 bottom-0 rounded-full bg-primary text-on-primary shadow-xs pointer-events-none transition-transform duration-300 ease-out"
          style={{
            width: `${100 / NAV_ITEMS.length}%`,
            transform: `translateX(${resolvedIndex * 100}%)`,
          }}
        />

        {/* Navigation items (Icon-only with 44px min touch target) */}
        {NAV_ITEMS.map((item, index) => {
          const Icon = item.icon;
          const isActive = resolvedIndex === index;

          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              aria-label={item.label}
              className={`relative z-10 flex-1 flex items-center justify-center min-h-[44px] h-11 rounded-full transition-transform active:scale-95 ${
                isActive
                  ? "text-on-primary"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              <Icon
                className={`h-5 w-5 transition-transform duration-200 ${
                  isActive ? "scale-105" : "scale-100"
                }`}
                strokeWidth={2}
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
