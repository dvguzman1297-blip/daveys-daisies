"use client";

import confetti from "canvas-confetti";
import { AnimatePresence, motion } from "framer-motion";
import { Download, Flower2, Loader2, MailOpen, Music, Volume2 } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { getMusic, isMusicTrackId } from "@/lib/catalog";
import type { BouquetRecord } from "@/types/bouquet";
import { BouquetCanvas } from "./BouquetCanvas";
import { LetterCard } from "./LetterCard";
import { MusicPlayer, TrackCredits, useLetterMusic } from "./LetterMusic";
import { YouTubeLetterMusic } from "./YouTubeLetterMusic";

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
  const startYouTube = useRef<(() => void) | null>(null);
  const hasMusic = !!track || !!bouquet.youtube;
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);

  const saveKeepsake = async () => {
    setSaving(true);
    setSaveError(false);
    try {
      const { renderKeepsake, downloadBlob } = await import("@/lib/keepsake");
      const blob = await renderKeepsake({
        to: bouquet.recipient_name,
        from: bouquet.sender_name,
        message: bouquet.message,
        theme: bouquet.theme,
        flowers: bouquet.flowers,
        vase: bouquet.vase_style,
      });
      downloadBlob(blob, `flowers-from-${bouquet.sender_name.trim().replace(/[^\w-]+/g, "-") || "a-friend"}.png`);
    } catch (err) {
      console.error(err);
      setSaveError(true);
    } finally {
      setSaving(false);
    }
  };

  const open = () => {
    setOpened(true);
    // Opening the envelope is the user gesture that lets the browser start audio.
    music.start();
    startYouTube.current?.();
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
    <main
      className={`paper-dots relative flex flex-1 flex-col items-center px-4 pt-10 sm:px-6 ${
        opened ? "pb-32" : "justify-center pb-16"
      }`}
    >
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <p className="text-sm font-bold uppercase tracking-widest text-sage-700">
          {bouquet.anonymous ? "Someone" : bouquet.sender_name} sent you flowers
        </p>
        <h1 className="mt-2 font-display text-4xl text-ink sm:text-5xl">For {bouquet.recipient_name}</h1>
        <p className="mt-2 text-ink-soft">
          {opened
            ? `${flowerCount} hand-picked ${flowerCount === 1 ? "bloom" : "blooms"}, just for you.`
            : "Something beautiful is waiting for you."}
        </p>
      </motion.header>

      {/* Just the envelope at first; the bouquet joins the letter once it's opened. */}
      <div
        className={`mt-6 grid w-full items-center gap-8 ${opened ? "max-w-5xl lg:grid-cols-2" : "max-w-md"}`}
      >
        {opened && (
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            className="w-full"
          >
            <BouquetCanvas
              flowers={bouquet.flowers}
              vase={bouquet.vase_style}
              mode="view"
              bloomDelay={0.5}
              className="mx-auto aspect-[4/5] w-full max-w-[15rem] lg:max-w-md"
            />
          </motion.div>
        )}

        <div className="mx-auto w-full max-w-md" style={{ perspective: 1200 }}>
          <AnimatePresence mode="wait">
            {!opened ? (
              <motion.button
                key="envelope"
                type="button"
                onClick={open}
                aria-label={bouquet.anonymous ? "Open your letter" : `Open the letter from ${bouquet.sender_name}`}
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
                {/* Address, like real mail */}
                <span
                  className={`absolute inset-x-[15%] top-[8%] flex flex-col items-center text-center leading-tight ${
                    bouquet.theme === "midnight" ? "text-cream/90" : "text-ink/80"
                  }`}
                >
                  <span className="w-full truncate font-hand text-2xl sm:text-3xl">For {bouquet.recipient_name}</span>
                  {!bouquet.anonymous && (
                    <span className="w-full truncate text-xs font-semibold opacity-80">from {bouquet.sender_name}</span>
                  )}
                </span>
                {/* Wax seal: a gentle pulse says "tap me" */}
                <motion.span
                  className="absolute left-1/2 top-[52%] grid size-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full shadow-md"
                  style={{ backgroundColor: colors.seal }}
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: 2.4 }}
                >
                  <Flower2 className="size-7 text-white/90" aria-hidden="true" />
                </motion.span>
                <span
                  className={`absolute inset-x-0 bottom-3 flex flex-col items-center gap-0.5 sm:bottom-4 ${
                    bouquet.theme === "midnight" ? "text-cream" : "text-ink"
                  }`}
                >
                  <span className="flex items-center gap-1.5 text-base font-bold">
                    <MailOpen className="size-4" aria-hidden="true" />
                    Tap to open your letter
                  </span>
                  {hasMusic && (
                    <span className="flex items-center gap-1 text-xs font-semibold opacity-80">
                      <Volume2 className="size-3.5" aria-hidden="true" />
                      Comes with music. Turn your sound on.
                    </span>
                  )}
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

          {/* Music plays in the background with no controls; the pill only appears if it isn't playing. */}
          {track && music.started && !music.playing && (
            <MusicPlayer
              title={track.title}
              credits={<TrackCredits track={track} />}
              playing={false}
              onPlay={music.play}
              onPause={music.pause}
            />
          )}
          {opened && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-5 flex flex-col items-center gap-2"
            >
              <button
                type="button"
                onClick={saveKeepsake}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-full border border-sage-300 bg-white/80 px-5 py-2.5 text-sm font-bold text-sage-700 transition hover:bg-sage-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-500 disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Download className="size-4" aria-hidden="true" />
                )}
                Save as a keepsake
              </button>
              {saveError && (
                <p role="alert" className="text-xs font-semibold text-blush-700">
                  Sorry, we couldn&apos;t make the image. Please try again.
                </p>
              )}
            </motion.div>
          )}
          {track && opened && (
            <p className="mt-4 text-center text-xs text-ink-soft">
              <Music className="mr-1 inline size-3 align-[-1px]" aria-hidden="true" />
              <TrackCredits track={track} />
            </p>
          )}

          {bouquet.youtube && <YouTubeLetterMusic clip={bouquet.youtube} opened={opened} startRef={startYouTube} />}

        </div>
      </div>

      {opened && (
        <motion.div
          className="fixed inset-x-0 bottom-5 z-20 flex justify-center px-4"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20, delay: 2.2 }}
        >
          <Link
            href="/create"
            className="inline-flex items-center gap-2 rounded-full bg-sage-700 px-6 py-3.5 font-bold text-white shadow-xl transition hover:-translate-y-0.5 hover:bg-sage-700/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-500"
          >
            <Flower2 className="size-5" aria-hidden="true" />
            Create Your Own
          </Link>
        </motion.div>
      )}
    </main>
  );
}
