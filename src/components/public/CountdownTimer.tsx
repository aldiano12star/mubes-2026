"use client";

import React, { useState, useEffect } from "react";

interface CountdownTimerProps {
  targetIso?: string;
}

export function CountdownTimer({
  targetIso = "2026-12-28T07:30:00+07:00",
}: CountdownTimerProps) {
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isPassed: boolean;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isPassed: false,
  });

  useEffect(() => {
    setMounted(true);

    const calculateTime = () => {
      const targetTime = new Date(targetIso).getTime();
      const now = Date.now();
      const diff = targetTime - now;

      if (diff <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isPassed: true,
        });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isPassed: false });
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [targetIso]);

  const units = [
    {
      label: "HARI",
      value: mounted
        ? timeLeft.isPassed
          ? "00"
          : String(timeLeft.days).padStart(2, "0")
        : "--",
    },
    {
      label: "JAM",
      value: mounted
        ? timeLeft.isPassed
          ? "00"
          : String(timeLeft.hours).padStart(2, "0")
        : "--",
    },
    {
      label: "MENIT",
      value: mounted
        ? timeLeft.isPassed
          ? "00"
          : String(timeLeft.minutes).padStart(2, "0")
        : "--",
    },
    {
      label: "DETIK",
      value: mounted
        ? timeLeft.isPassed
          ? "00"
          : String(timeLeft.seconds).padStart(2, "0")
        : "--",
    },
  ];

  return (
    <div className="space-y-3">
      {/* Editorial Header with Spike Icon & Status */}
      <div className="flex items-center gap-3">
        {/* Precision Spike SVG Silhouette */}
        <div className="relative flex items-center justify-center text-brand">
          <svg
            className="w-5 h-5 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* The Spike outer pyramid frame */}
            <path
              d="M12 2L2 20H22L12 2Z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="bevel"
            />
            {/* Inner mechanical core */}
            <path
              d="M12 8L6.5 18H17.5L12 8Z"
              fill="currentColor"
              fillOpacity="0.25"
              stroke="currentColor"
              strokeWidth="1.2"
            />
            {/* Active Core Beacon */}
            <circle cx="12" cy="14" r="2" fill="#FF4655" className="animate-ping" />
            <circle cx="12" cy="14" r="1.5" fill="#FFFFFF" />
          </svg>
        </div>

        <div className="w-5 h-[2px] bg-brand" />

        <span className="font-condensed font-bold text-xs tracking-[0.2em] text-ink uppercase">
          SPIKE DETONATION COUNTDOWN
        </span>

        <span className="ml-auto font-mono text-[10px] text-brand tracking-widest uppercase px-2 py-0.5 border border-brand/30 bg-brand/10">
          ARMED
        </span>
      </div>

      {/* Modern High-Impact Grid with Barlow Condensed */}
      <div className="grid grid-cols-4 gap-2 sm:gap-3 w-full">
        {units.map((unit) => (
          <div
            key={unit.label}
            className="relative border border-edge hover:border-brand/50 bg-[#121E2A]/90 valo-chamfer-sm p-2 sm:p-3 flex flex-col items-center justify-center text-center transition-colors group"
          >
            {/* Subtle top indicator tick */}
            <div className="absolute top-1 right-1 w-1.5 h-1.5 border-t border-r border-edge-strong group-hover:border-brand transition-colors" />

            <span className="font-condensed font-bold text-3xl sm:text-4xl text-ink tabular-nums leading-none tracking-tight">
              {unit.value}
            </span>
            <span className="font-condensed font-semibold text-[10px] sm:text-[11px] tracking-[0.16em] text-ink-muted uppercase mt-1">
              {unit.label}
            </span>
          </div>
        ))}
      </div>

      {/* Tactical Progress Bar */}
      <div className="w-full h-[2px] bg-edge relative overflow-hidden">
        <div className="h-full bg-brand w-2/3 animate-pulse" />
      </div>
    </div>
  );
}
