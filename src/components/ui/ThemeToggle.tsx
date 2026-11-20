"use client";

import React, { useSyncExternalStore } from "react";
import { useTheme } from "@/components/theme/ThemeProvider";
import { Sun, Moon } from "lucide-react";

const emptySubscribe = () => () => {};

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  if (!mounted) {
    return (
      <div
        className={`w-11 h-11 rounded-xl border border-edge bg-card opacity-50 ${className}`}
        aria-hidden="true"
      />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Beralih ke mode terang" : "Beralih ke mode gelap"}
      title={isDark ? "Mode Terang" : "Mode Gelap"}
      className={`min-h-[44px] min-w-[44px] p-2.5 rounded-xl border border-edge bg-card hover:bg-surface-raised text-ink transition-all active:scale-95 cursor-pointer flex items-center justify-center shadow-xs ${className}`}
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-warning transition-transform rotate-0 scale-100" />
      ) : (
        <Moon className="w-5 h-5 text-ink-secondary transition-transform rotate-0 scale-100" />
      )}
    </button>
  );
}
