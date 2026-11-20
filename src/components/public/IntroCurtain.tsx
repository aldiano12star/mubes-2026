"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function IntroCurtain() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const hasSeen = sessionStorage.getItem("mubes_intro_seen");
      if (!hasSeen) {
        setIsVisible(true);
        sessionStorage.setItem("mubes_intro_seen", "true");
        const timer = setTimeout(() => {
          setIsVisible(false);
        }, 750);
        return () => clearTimeout(timer);
      }
    } catch {
      // Ignore sessionStorage errors (e.g. strict privacy modes)
    }
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="intro-curtain"
          initial={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" }}
          exit={{
            clipPath: "polygon(0 0, 100% 0, 100% 0%, 0 -15%)",
            transition: { duration: 0.65, ease: [0.76, 0, 0.24, 1] },
          }}
          className="fixed inset-0 z-50 pointer-events-none flex flex-col items-center justify-center bg-[#FF4655] text-white overflow-hidden"
        >
          {/* Background diagonal lines */}
          <div className="absolute inset-0 opacity-15 bg-[repeating-linear-gradient(45deg,transparent,transparent_20px,rgba(0,0,0,0.3)_20px,rgba(0,0,0,0.3)_40px)]" />

          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.08, opacity: 0, y: -40 }}
            transition={{ duration: 0.45 }}
            className="relative z-10 flex flex-col items-center text-center px-4"
          >
            <div className="w-12 h-[3px] bg-white mb-3" />
            <h1 className="font-display text-4xl sm:text-6xl tracking-widest uppercase font-bold text-white drop-shadow-md">
              SABA EXPLOIT
            </h1>
            <p className="font-condensed text-sm sm:text-base tracking-[0.28em] font-semibold uppercase text-white/90 mt-1">
              PROTOCOL: VALORANT • MUBES 2026
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
