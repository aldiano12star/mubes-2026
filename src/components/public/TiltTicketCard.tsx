"use client";

import React, { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface TiltTicketCardProps {
  children: React.ReactNode;
}

export function TiltTicketCard({ children }: TiltTicketCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 150 };
  const smoothX = useSpring(x, springConfig);
  const smoothY = useSpring(y, springConfig);

  const rotateX = useTransform(smoothY, [-0.5, 0.5], [7, -7]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-7, 7]);
  const glareOpacity = useTransform(smoothY, [-0.5, 0, 0.5], [0.15, 0, 0.15]);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) {
      return;
    }
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;

    const normalizedX = (e.clientX - rect.left) / rect.width - 0.5;
    const normalizedY = (e.clientY - rect.top) / rect.height - 0.5;

    x.set(normalizedX);
    y.set(normalizedY);
  };

  const handlePointerLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div
      style={{ perspective: 1000 }}
      className="relative w-full flex justify-center py-2"
    >
      <motion.div
        ref={cardRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className="relative w-full max-w-2xl transition-shadow duration-300 hover:shadow-[0_25px_50px_rgba(0,0,0,0.85)]"
      >
        {children}

        {/* Diagonal Sheen / Glare Highlight (pointer-events-none) */}
        <motion.div
          style={{ opacity: glareOpacity }}
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none valo-chamfer bg-gradient-to-tr from-transparent via-white/10 to-transparent mix-blend-overlay"
        />
      </motion.div>
    </div>
  );
}
