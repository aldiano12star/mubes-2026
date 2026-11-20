"use client";

import React, { useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { X } from "lucide-react";

const emptySubscribe = () => () => {};

function useIsClient() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  backdropClassName?: string;
  zIndex?: string;
  showCloseButton?: boolean;
}

/**
 * Universal Unified Modal & BottomSheet Component
 *
 * - Mobile (< md): Apple-style Bottom Sheet sliding up from viewport bottom,
 *   with drag handle indicator, max-height 88dvh, independent scrolling, and safe-area clearance.
 * - Desktop (>= md): Viewport-centered dialog with crisp border and elevated surface.
 * - Escape key listener & background scroll locking with layout-shift prevention.
 */
export function Modal({
  isOpen,
  onClose,
  children,
  title,
  description,
  footer,
  className = "",
  backdropClassName = "",
  zIndex = "z-50",
  showCloseButton = true,
}: ModalProps) {
  const isClient = useIsClient();
  useBodyScrollLock(isOpen);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !isClient) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className={`fixed inset-0 ${zIndex} flex flex-col justify-end md:justify-center md:items-center p-0 md:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 ${backdropClassName}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className={`relative w-full rounded-t-3xl md:rounded-2xl bg-card border-t md:border border-edge shadow-2xl flex flex-col max-h-[88dvh] md:max-h-[85vh] md:max-w-lg overflow-hidden animate-in slide-in-from-bottom-8 md:slide-in-from-bottom-0 md:zoom-in-95 duration-200 ease-out ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle pill for mobile viewports */}
        <div className="md:hidden flex justify-center pt-3 pb-1 shrink-0 bg-card">
          <div className="w-10 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
        </div>

        {/* Modal Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-edge shrink-0 bg-card">
            {title ? (
              <div className="min-w-0 flex-1 pr-3">
                <h2 className="text-base sm:text-lg font-semibold text-ink truncate">
                  {title}
                </h2>
                {description && (
                  <p className="text-xs text-ink-muted mt-0.5 truncate">
                    {description}
                  </p>
                )}
              </div>
            ) : (
              <div />
            )}
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Tutup dialog"
                className="min-h-[44px] min-w-[44px] rounded-full flex items-center justify-center text-ink-muted hover:text-ink hover:bg-surface-raised transition-colors cursor-pointer shrink-0"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        )}

        {/* Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain min-h-0 w-full p-5">
          {children}
        </div>

        {/* Sticky Action Footer */}
        {footer && (
          <div className="sticky bottom-0 z-10 shrink-0 bg-card border-t border-edge px-5 py-4 pb-safe">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
