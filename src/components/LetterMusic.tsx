"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Info, Music, Pause, Play } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { MusicTrack } from "@/types/bouquet";

const TARGET_VOLUME = 0.5;
const FADE_MS = 2500;

/**
 * Background music for an opened letter. Browsers only allow audio to start
 * after a user gesture, so `start()` must be called from a click handler
 * (opening the envelope). Fades in softly and loops.
 */
export function useLetterMusic(track: MusicTrack | null) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeRef = useRef<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);

  const stopFade = () => {
    if (fadeRef.current) cancelAnimationFrame(fadeRef.current);
    fadeRef.current = null;
  };

  const fadeIn = (audio: HTMLAudioElement) => {
    stopFade();
    const from = audio.volume;
    const t0 = performance.now();
    const step = (now: number) => {
      // rAF timestamps can land slightly before t0, so clamp both ends (volume must stay in [0, 1]).
      const p = Math.min(1, Math.max(0, (now - t0) / FADE_MS));
      audio.volume = from + (TARGET_VOLUME - from) * p;
      if (p < 1) fadeRef.current = requestAnimationFrame(step);
    };
    fadeRef.current = requestAnimationFrame(step);
  };

  const play = () => {
    if (!track) return;
    const audio = (audioRef.current ??= Object.assign(new Audio(track.src), { loop: true, volume: 0 }));
    setStarted(true);
    audio.play().then(
      () => {
        setPlaying(true);
        fadeIn(audio);
      },
      // Autoplay blocked or file failed: leave the player visible so they can tap play.
      () => setPlaying(false),
    );
  };

  const pause = () => {
    stopFade();
    audioRef.current?.pause();
    setPlaying(false);
  };

  useEffect(
    () => () => {
      stopFade();
      audioRef.current?.pause();
    },
    [],
  );

  return { start: play, play, pause, playing, started };
}

interface MusicPlayerProps {
  title: string;
  /** Shown when the info button is tapped. */
  credits: ReactNode;
  playing: boolean;
  onPlay: () => void;
  onPause: () => void;
}

/** Pause/play pill shown in the flow under the letter, only while music isn't playing (e.g. autoplay was blocked), with pause/play and the required credits. */
export function MusicPlayer({ title, credits, playing, onPlay, onPause }: MusicPlayerProps) {
  const [showCredits, setShowCredits] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 22, delay: 2.5 }}
      className="mt-4 flex w-full flex-col items-center gap-2"
    >
      <div className="flex items-center gap-2 rounded-full border border-sage-100 bg-white/90 py-1.5 pl-1.5 pr-2 shadow-soft backdrop-blur">
        <button
          type="button"
          onClick={playing ? onPause : onPlay}
          aria-label={playing ? `Pause ${title}` : `Play ${title}`}
          className="grid size-9 shrink-0 place-items-center rounded-full bg-blush-700 text-white transition hover:bg-blush-700/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blush-500"
        >
          {playing ? <Pause className="size-4" aria-hidden="true" /> : <Play className="size-4" aria-hidden="true" />}
        </button>
        <span className="flex min-w-0 items-center gap-1.5 text-sm">
          <Equalizer active={playing} />
          <span className="truncate font-bold text-ink">{title}</span>
        </span>
        <button
          type="button"
          onClick={() => setShowCredits((s) => !s)}
          aria-expanded={showCredits}
          aria-label="Music credits"
          className="grid size-7 shrink-0 place-items-center rounded-full text-ink-soft transition hover:bg-sage-100 focus-visible:outline-2 focus-visible:outline-sage-500"
        >
          <Info className="size-4" aria-hidden="true" />
        </button>
      </div>

      <AnimatePresence>
        {showCredits && (
          <motion.p
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="max-w-xs rounded-2xl border border-sage-100 bg-white/95 p-3 text-xs leading-relaxed text-ink-soft shadow-soft"
          >
            <Music className="mr-1 inline size-3.5 align-[-2px]" aria-hidden="true" />
            {credits}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/** Credit line for a built-in track (required for the CC BY ones). */
export function TrackCredits({ track }: { track: MusicTrack }) {
  return (
    <>
      {track.credit}.{" "}
      {track.licenseUrl && (
        <a href={track.licenseUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-blush-700 underline">
          License
        </a>
      )}
      {track.licenseUrl && " · "}
      <a href={track.sourceUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-blush-700 underline">
        Source
      </a>
    </>
  );
}

/** Three little bars that bounce while music plays. */
function Equalizer({ active }: { active: boolean }) {
  return (
    <span className="flex h-3.5 items-end gap-[2px]" aria-hidden="true">
      {[0, 0.2, 0.4].map((delay) => (
        <motion.span
          key={delay}
          className="w-[3px] rounded-full bg-blush-500"
          animate={active ? { height: ["30%", "100%", "45%", "80%", "30%"] } : { height: "30%" }}
          transition={active ? { duration: 1.1, repeat: Infinity, delay, ease: "easeInOut" } : { duration: 0.3 }}
        />
      ))}
    </span>
  );
}
