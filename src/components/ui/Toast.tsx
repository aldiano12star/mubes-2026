"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

export interface ToastOptions {
  description?: string;
  duration?: number;
}

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  description?: string;
  duration?: number;
}

type ToastListener = (toasts: ToastItem[]) => void;

let toastsState: ToastItem[] = [];
const listeners = new Set<ToastListener>();

function notifyListeners() {
  listeners.forEach((listener) => listener([...toastsState]));
}

function parseToastArgs(
  descriptionOrOptions?: string | ToastOptions,
  duration?: number
): { description?: string; duration: number } {
  if (typeof descriptionOrOptions === "object" && descriptionOrOptions !== null) {
    return {
      description: descriptionOrOptions.description,
      duration: descriptionOrOptions.duration ?? 4000,
    };
  }
  return {
    description: descriptionOrOptions,
    duration: typeof duration === "number" ? duration : 4000,
  };
}

export const toast = {
  show: (
    type: ToastType,
    message: string,
    descriptionOrOptions?: string | ToastOptions,
    duration?: number
  ) => {
    const { description, duration: toastDuration } = parseToastArgs(
      descriptionOrOptions,
      duration
    );
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastItem = {
      id,
      type,
      message,
      description,
      duration: toastDuration,
    };
    toastsState = [...toastsState, newToast];
    notifyListeners();

    if (toastDuration > 0) {
      setTimeout(() => {
        toast.dismiss(id);
      }, toastDuration);
    }
    return id;
  },
  success: (
    message: string,
    descriptionOrOptions?: string | ToastOptions,
    duration?: number
  ) => toast.show("success", message, descriptionOrOptions, duration),
  error: (
    message: string,
    descriptionOrOptions?: string | ToastOptions,
    duration?: number
  ) => toast.show("error", message, descriptionOrOptions, duration),
  info: (
    message: string,
    descriptionOrOptions?: string | ToastOptions,
    duration?: number
  ) => toast.show("info", message, descriptionOrOptions, duration),
  dismiss: (id: string) => {
    toastsState = toastsState.filter((t) => t.id !== id);
    notifyListeners();
  },
};

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const handleUpdate = (updated: ToastItem[]) => {
      setToasts(updated);
    };
    listeners.add(handleUpdate);
    return () => {
      listeners.delete(handleUpdate);
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none p-2 sm:p-0"
    >
      {toasts.map((item) => {
        const icons = {
          success: <CheckCircle2 className="w-5 h-5 text-success shrink-0" />,
          error: <AlertCircle className="w-5 h-5 text-danger shrink-0" />,
          info: <Info className="w-5 h-5 text-info shrink-0" />,
        };

        return (
          <div
            key={item.id}
            role="status"
            className="pointer-events-auto w-full p-4 rounded-xl bg-card border border-edge shadow-lg flex items-start gap-3 animate-in slide-in-from-bottom-2 fade-in duration-200 transition-all"
          >
            {icons[item.type]}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-ink leading-snug">
                {item.message}
              </p>
              {item.description && (
                <p className="text-xs text-ink-muted mt-0.5 leading-relaxed">
                  {item.description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => toast.dismiss(item.id)}
              aria-label="Tutup notifikasi"
              className="text-ink-muted hover:text-ink transition-colors p-1 -mr-1 -mt-1 rounded-lg hover:bg-surface-raised cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
