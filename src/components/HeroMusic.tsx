"use client";

import { motion } from "framer-motion";
import { Loader2, Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { HERO_MUSIC } from "@/lib/hero-music";
import { useYouTubeClip } from "@/lib/youtube-player";

/** A day is longer than any song, so the clip never hits its end bound. */
const NO_END = 24 * 60 * 60;
/** How long to wait for autoplay before deciding the browser blocked it. */
const AUTOPLAY_WAIT_MS = 5000;

/**
 * Homepage music. It tries to start on its own; the chip then toggles it.
 * Browsers often refuse to play sound before the visitor has interacted with
 * the page, so if autoplay is blocked the chip falls back to its muted state
 * and the music starts on the visitor's first tap or keypress anywhere.
 */
export function HeroMusic() {
  const [on, setOn] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [failed, setFailed] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const onFailed = useCallback(() => {
    setFailed(true);
    setOn(false);
  }, []);

  // No sound after a few seconds means the browser blocked autoplay.
  useEffect(() => {
    if (!on || playing) return;
    const t = setTimeout(() => {
      setOn(false);
      setBlocked(true);
    }, AUTOPLAY_WAIT_MS);
    return () => clearTimeout(t);
  }, [on, playing]);

  // While blocked, the first interaction anywhere (other than the chip, which handles itself) starts the music.
  useEffect(() => {
    if (!blocked) return;
    const start = (e: Event) => {
      if (e.target instanceof Node && buttonRef.current?.contains(e.target)) return;
      setBlocked(false);
      setOn(true);
    };
    window.addEventListener("pointerup", start, { once: true });
    window.addEventListener("keydown", start, { once: true });
    return () => {
      window.removeEventListener("pointerup", start);
      window.removeEventListener("keydown", start);
    };
  }, [blocked]);

  const toggle = () => {
    setBlocked(false);
    setOn((o) => !o);
  };

  const Icon = playing ? Volume2 : VolumeX;
  const starting = on && !playing;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={toggle}
        disabled={failed}
        aria-pressed={on}
        aria-label={playing ? "Mute the music" : starting ? "Loading the music" : "Play the music"}
        className="flex items-center gap-2 rounded-full border border-sage-100 bg-white/90 py-1.5 pl-1.5 pr-3 text-left shadow-soft backdrop-blur transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-500 disabled:opacity-60"
      >
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-blush-100 text-blush-700">
          {starting ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Icon className="size-4" aria-hidden="true" />
          )}
        </span>
        <span className="leading-tight">
          <span className="block text-sm font-bold text-ink">{HERO_MUSIC.title}</span>
          <span className="block text-xs text-ink-soft">
            {failed
              ? "Music unavailable"
              : playing
                ? `${HERO_MUSIC.artist} · tap to mute`
                : starting
                  ? "Starting…"
                  : "Violin · tap to play"}
          </span>
        </span>
        <span className="flex h-3.5 items-end gap-[2px]" aria-hidden="true">
          {[0, 0.2, 0.4].map((d) => (
            <motion.span
              key={d}
              className="w-[3px] rounded-full bg-blush-500"
              animate={playing ? { height: ["30%", "100%", "45%", "80%", "30%"] } : { height: "30%" }}
              transition={playing ? { duration: 1.1, delay: d, repeat: Infinity, ease: "easeInOut" } : { duration: 0.3 }}
            />
          ))}
        </span>
      </button>
      {!failed && <HeroPlayer wantPlay={on} onPlaying={setPlaying} onFailed={onFailed} />}
    </>
  );
}

function HeroPlayer({
  wantPlay,
  onPlaying,
  onFailed,
}: {
  wantPlay: boolean;
  onPlaying: (playing: boolean) => void;
  onFailed: () => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const player = useYouTubeClip(containerRef, { videoId: HERO_MUSIC.videoId, start: 0, end: NO_END, volume: 55 });
  const { play, pause, playing, failed } = player;

  useEffect(() => {
    if (wantPlay) play({ fade: true });
    else pause();
  }, [wantPlay, play, pause]);
  useEffect(() => onPlaying(playing), [playing, onPlaying]);
  useEffect(() => {
    if (failed) onFailed();
  }, [failed, onFailed]);

  // Audio only: the player is kept off-screen rather than shown.
  return (
    <div aria-hidden="true" className="pointer-events-none fixed -left-[9999px] top-0 h-[200px] w-[200px]">
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
}
