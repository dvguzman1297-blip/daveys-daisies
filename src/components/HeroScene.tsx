"use client";

import { motion } from "framer-motion";
import type { BouquetFlower, VaseStyle } from "@/types/bouquet";
import { BouquetCanvas } from "./BouquetCanvas";
import { HeroMusic } from "./HeroMusic";

const PETALS = [
  { left: "2%", top: "22%", size: 14, delay: 0, duration: 7 },
  { left: "10%", top: "70%", size: 10, delay: 1.2, duration: 8 },
  { left: "88%", top: "6%", size: 12, delay: 0.6, duration: 6.5 },
  { left: "74%", top: "46%", size: 9, delay: 2, duration: 7.5 },
  { left: "46%", top: "2%", size: 11, delay: 1.6, duration: 9 },
];

/**
 * The homepage hero: a bouquet with a letter and a song floating beside it,
 * so a visitor sees what they'd be sending, not just the flowers.
 * The letter and petals are decorative and hidden on small screens to keep the bouquet clear;
 * the music toggle stays on every screen size.
 */
export function HeroScene({ flowers, vase }: { flowers: BouquetFlower[]; vase: VaseStyle }) {
  return (
    <div className="relative mx-auto -mt-6 w-full max-w-sm sm:-mt-10 lg:mt-0 lg:max-w-lg">
      {/* Music toggle: sits above the bouquet on phones, floats at its top right from sm up. */}
      <motion.div
        className="relative z-10 mb-3 flex justify-center sm:absolute sm:right-[2%] sm:top-[10%] sm:mb-0 sm:block"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 16, delay: 2.2 }}
      >
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 5, delay: 0.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <HeroMusic />
        </motion.div>
      </motion.div>

      {/* Drifting petals */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden sm:block">
        {PETALS.map((p, i) => (
          <motion.span
            key={i}
            className="absolute block rounded-[50%_50%_50%_50%/60%_60%_40%_40%] bg-blush-300/80"
            style={{ left: p.left, top: p.top, width: p.size, height: p.size * 1.4 }}
            animate={{ y: [0, 18, 0], x: [0, 8, 0], rotate: [0, 40, 0] }}
            transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </div>

      <BouquetCanvas
        flowers={flowers}
        vase={vase}
        bloomDelay={0.2}
        className="aspect-[4/5] w-full sm:w-[88%]"
      />

      {/* Letter card, tucked in beside the vase */}
      <motion.div
        aria-hidden="true"
        className="absolute bottom-[8%] right-0 hidden w-[52%] sm:block"
        initial={{ opacity: 0, y: 24, rotate: 0 }}
        animate={{ opacity: 1, y: 0, rotate: 5 }}
        transition={{ type: "spring", stiffness: 120, damping: 16, delay: 1.7 }}
      >
        <motion.div
          animate={{ y: [0, -7, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="rounded-2xl border border-[#e6d6b3] bg-parchment p-4 text-ink shadow-soft"
        >
          <p className="text-[10px] font-bold uppercase tracking-widest text-ink-soft">Dear</p>
          <p className="font-display text-xl leading-tight">Someone Special,</p>
          <p className="mt-2 font-hand text-xl leading-snug">
            Thinking of you today, and every day. These are for you.
          </p>
          <p className="mt-2 text-right font-hand text-lg leading-tight text-ink-soft">
            With love,
            <br />
            <span className="text-ink">Dave</span>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
