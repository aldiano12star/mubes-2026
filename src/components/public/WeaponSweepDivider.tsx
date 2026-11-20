"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

export function WeaponSweepDivider() {
  const containerRef = useRef<HTMLDivElement>(null);
  const vandalRef = useRef<HTMLDivElement>(null);
  const meleeRef = useRef<HTMLDivElement>(null);
  const [vandalError, setVandalError] = useState(false);
  const [meleeError, setMeleeError] = useState(false);

  useGSAP(
    () => {
      gsap.registerPlugin(ScrollTrigger);

      const prefersReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      if (prefersReduced) return;

      if (vandalRef.current && containerRef.current) {
        gsap.fromTo(
          vandalRef.current,
          { xPercent: 25, rotate: -4 },
          {
            xPercent: -25,
            rotate: 2,
            ease: "none",
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: 1,
            },
          }
        );
      }

      if (meleeRef.current && containerRef.current) {
        gsap.fromTo(
          meleeRef.current,
          { xPercent: -20, rotate: 10 },
          {
            xPercent: 20,
            rotate: -8,
            ease: "none",
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: 1.2,
            },
          }
        );
      }
    },
    { scope: containerRef }
  );

  const marqueeText =
    "MUBES SABA EXPLOIT 2026 • 28 DESEMBER 2026 • RUANG YUDISTIRA SMAN 1 BANTUL • PROTOCOL VALORANT • LOCK IN YOUR AGENT • ";

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden bg-[#0F1923] py-8 sm:py-12 select-none"
    >
      {/* ── HIGH-CONTRAST KINETIC RED MARQUEE ── */}
      <div className="relative w-full bg-[#FF4655] py-2.5 sm:py-3.5 transform -rotate-1.5 scale-105 border-y-2 border-white/20 shadow-lg overflow-hidden">
        <div className="animate-valo-marquee whitespace-nowrap flex items-center font-condensed font-bold text-sm sm:text-lg tracking-[0.22em] text-white uppercase">
          <span>{marqueeText}</span>
          <span>{marqueeText}</span>
          <span>{marqueeText}</span>
          <span>{marqueeText}</span>
        </div>
      </div>

      {/* ── SCRUBBED WEAPON FLY-BY SHOWCASE ── */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-28 sm:h-36 flex items-center justify-between pointer-events-none">
        {/* Tactical Knife (Left to Right Sweep) */}
        {!meleeError && (
          <div
            ref={meleeRef}
            className="relative w-36 sm:w-56 h-16 sm:h-24 opacity-65 drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)]"
          >
            <Image
              src="/images/valorant/weapon-melee.png"
              alt="Valorant Tactical Knife"
              fill
              sizes="(max-width: 768px) 150px, 220px"
              className="object-contain filter contrast-125"
              onError={() => setMeleeError(true)}
            />
          </div>
        )}

        {/* Vandal Rifle (Right to Left Sweep) */}
        {!vandalError && (
          <div
            ref={vandalRef}
            className="relative w-64 sm:w-96 lg:w-[480px] h-20 sm:h-28 opacity-85 drop-shadow-[0_15px_30px_rgba(0,0,0,0.8)] ml-auto"
          >
            <Image
              src="/images/valorant/weapon-vandal.png"
              alt="Valorant Vandal Rifle"
              fill
              sizes="(max-width: 768px) 300px, 480px"
              className="object-contain filter contrast-125"
              onError={() => setVandalError(true)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
