"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  Settings,
  ExternalLink,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
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

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-edge bg-card min-h-screen p-4 select-none shrink-0 sticky top-0 h-screen">
      {/* Brand Header */}
      <div className="px-3 py-3 mb-4 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center font-bold text-sm shadow-xs">
            U
          </div>
          <span className="font-semibold text-base text-ink tracking-tight">
            App Shell
          </span>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`min-h-[44px] px-3.5 py-2.5 rounded-xl flex items-center gap-3 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary text-on-primary shadow-xs"
                  : "text-ink-secondary hover:text-ink hover:bg-surface-raised"
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Area: ThemeToggle & Mode Switch */}
      <div className="pt-4 border-t border-edge flex items-center justify-between gap-2">
        <Link
          href="/"
          className="text-xs text-ink-muted hover:text-ink flex items-center gap-1.5 transition-colors"
        >
          <span>Ke Website</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
        <ThemeToggle />
      </div>
    </aside>
  );
}
