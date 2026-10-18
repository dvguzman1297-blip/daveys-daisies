"use client";

import confetti from "canvas-confetti";
import { AnimatePresence, motion } from "framer-motion";
import { Flower2, MailOpen, Volume2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { getMusic, isMusicTrackId } from "@/lib/catalog";
import type { BouquetRecord } from "@/types/bouquet";
import { BouquetCanvas } from "./BouquetCanvas";
import { LetterCard } from "./LetterCard";
import { MusicPlayer, useLetterMusic } from "./LetterMusic";

const ENVELOPE: Record<BouquetRecord["theme"], { body: string; flap: string; seal: string }> = {
  parchment: { body: "#efe0bf", flap: "#e6d2a8", seal: "#c94b64" },
  blush: { body: "#f6cfd6", flap: "#f0b8c3", seal: "#a84a5f" },
  midnight: { body: "#2e3260", flap: "#383d72", seal: "#efc24a" },
};

export function RecipientView({ bouquet }: { bouquet: BouquetRecord }) {
  const [opened, setOpened] = useState(false);
  const colors = ENVELOPE[bouquet.theme];
  const flowerCount = bouquet.flowers.reduce((s, f) => s + f.count, 0);
  const track = isMusicTrackId(bouquet.music) ? getMusic(bouquet.music) : null;
  const music = useLetterMusic(track);

  const open = () => {
    setOpened(true);
    // Opening the envelope is the user gesture that lets the browser start audio.
    music.start();
    setTimeout(() => {
      confetti({
        particleCount: 60,
        spread: 80,
        origin: { y: 0.55 },
        colors: ["#f3bfc8", "#fbe49e", "#b9cbb0", "#ffffff"],
        shapes: ["circle"],
        disableForReducedMotion: true,
      });
    }, 450);
  };

  return (
    <main className="paper-dots relative flex flex-1 flex-col items-center px-4 pb-32 pt-10 sm:px-6">
      {track && music.started && (
        <MusicPlayer track={track} playing={music.playing} onPlay={music.play} onPause={music.pause} />
      )}

      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <p className="text-sm font-bold uppercase tracking-widest text-sage-700">
          {bouquet.sender_name} sent you flowers
        </p>
        <h1 className="mt-2 font-display text-4xl text-ink sm:text-5xl">For {bouquet.recipient_name}</h1>
        <p className="mt-2 text-ink-soft">
          {flowerCount} hand-picked {flowerCount === 1 ? "bloom" : "blooms"}, just for you.
        </p>
      </motion.header>

      <div className="mt-6 grid w-full max-w-5xl items-center gap-8 lg:grid-cols-2">
        <BouquetCanvas
          flowers={bouquet.flowers}
          vase={bouquet.vase_style}
          mode="view"
          bloomDelay={0.4}
          className="mx-auto aspect-[4/5] w-full max-w-md"
        />

        <div className="mx-auto w-full max-w-md" style={{ perspective: 1200 }}>
          <AnimatePresence mode="wait">
            {!opened ? (
              <motion.button
                key="envelope"
                type="button"
                onClick={open}
                aria-label={`Open the letter from ${bouquet.sender_name}`}
                className="group relative block aspect-[3/2] w-full rounded-2xl shadow-soft focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blush-500"
                style={{ backgroundColor: colors.body }}
                initial={{ opacity: 0, y: 30, rotate: -3 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  rotate: -2,
                  transition: { type: "spring", stiffness: 180, damping: 16, delay: 1.2 },
                }}
                exit={{ opacity: 0, y: 60, scale: 0.9, transition: { duration: 0.35, delay: 0.25 } }}
                whileHover={{ rotate: 0, y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 300, damping: 18 }}
              >
                {/* Side folds */}
                <svg viewBox="0 0 300 200" className="absolute inset-0 h-full w-full" aria-hidden="true">
                  <path d="M0 200 L150 100 L300 200 Z" fill="black" fillOpacity={0.06} />
                  <path d="M0 0 L120 110 L0 200 Z" fill="white" fillOpacity={0.08} />
                  <path d="M300 0 L180 110 L300 200 Z" fill="black" fillOpacity={0.04} />
                </svg>
                {/* Flap */}
                <motion.svg
                  viewBox="0 0 300 120"
                  className="absolute inset-x-0 top-0 w-full"
                  style={{ originY: 0 }}
                  exit={{ rotateX: 180, transition: { duration: 0.35 } }}
                  aria-hidden="true"
                >
                  <path d="M0 0 L300 0 L150 115 Z" fill={colors.flap} />
                </motion.svg>
                {/* Wax seal */}
                <span
                  className="absolute left-1/2 top-[52%] grid size-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full shadow-md transition group-hover:scale-110"
                  style={{ backgroundColor: colors.seal }}
                >
                  <Flower2 className="size-7 text-white/90" aria-hidden="true" />
                </span>
                <span
                  className={`absolute inset-x-0 bottom-4 flex items-center justify-center gap-1.5 text-sm font-bold ${
                    bouquet.theme === "midnight" ? "text-cream/80" : "text-ink/70"
                  }`}
                >
                  <MailOpen className="size-4" aria-hidden="true" />
                  Tap to open your letter
                </span>
              </motion.button>
            ) : (
              <motion.div
                key="letter"
                initial={{ opacity: 0, y: 80, rotateX: -70, scale: 0.85 }}
                animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 110, damping: 15, delay: 0.1 }}
                style={{ originY: 0 }}
              >
                <LetterCard
                  to={bouquet.recipient_name}
                  from={bouquet.sender_name}
                  message={bouquet.message}
                  theme={bouquet.theme}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {track && !opened && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.8 }}
              className="mt-4 flex items-center justify-center gap-1.5 text-sm font-semibold text-ink-soft"
            >
              <Volume2 className="size-4 text-blush-500" aria-hidden="true" />
              This letter comes with music. Turn your sound on.
            </motion.p>
          )}
        </div>
      </div>

      <motion.div
        className="fixed inset-x-0 bottom-5 z-20 flex justify-center px-4"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20, delay: 2 }}
      >
        <Link
          href="/create"
          className="inline-flex items-center gap-2 rounded-full bg-sage-700 px-6 py-3.5 font-bold text-white shadow-xl transition hover:-translate-y-0.5 hover:bg-sage-700/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-500"
        >
          <Flower2 className="size-5" aria-hidden="true" />
          Create Your Own
        </Link>
      </motion.div>
    </main>
  );
}
