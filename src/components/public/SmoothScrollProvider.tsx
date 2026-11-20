"use client";

import React, { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let lenis: Lenis | undefined;
    let update: ((time: number) => void) | undefined;

    if (!prefersReduced) {
      lenis = new Lenis({
        duration: 1.2,
        smoothWheel: true,
      });

      // 1. Sinkronisasi posisi ScrollTrigger setiap kali Lenis melakukan scroll
      lenis.on("scroll", ScrollTrigger.update);

      // 2. Integrasikan Lenis dengan GSAP ticker (time GSAP dalam detik -> convert ke ms)
      update = (time: number) => {
        lenis?.raf(time * 1000);
      };
      gsap.ticker.add(update);

      // 3. Matikan lagSmoothing GSAP agar tidak terjadi jitter saat frame berat
      gsap.ticker.lagSmoothing(0);

      // 4. Handle anchor links smooth scroll (#id)
      const handleAnchorClick = (e: MouseEvent) => {
        const target = (e.target as HTMLElement).closest("a");
        if (!target) return;
        const href = target.getAttribute("href");
        if (href && href.startsWith("#") && href.length > 1) {
          const targetEl = document.querySelector(href);
          if (targetEl) {
            e.preventDefault();
            lenis?.scrollTo(targetEl as HTMLElement, { offset: -70 });
          }
        }
      };

      document.addEventListener("click", handleAnchorClick);

      return () => {
        document.removeEventListener("click", handleAnchorClick);
        if (update) {
          gsap.ticker.remove(update);
        }
        if (lenis) {
          lenis.destroy();
        }
        ScrollTrigger.getAll().forEach((t) => t.kill());
      };
    }

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return <>{children}</>;
}
