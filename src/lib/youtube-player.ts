"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";

/** The slice of the YouTube IFrame Player API we use. */
interface YTPlayer {
  playVideo(): void;
  pauseVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  getCurrentTime(): number;
  getDuration(): number;
  setVolume(volume: number): void;
  destroy(): void;
}

interface YTNamespace {
  Player: new (
    el: HTMLElement,
    options: {
      host?: string;
      videoId: string;
      width?: string;
      height?: string;
      playerVars?: Record<string, number | string>;
      events?: {
        onReady?: () => void;
        onStateChange?: (e: { data: number }) => void;
        onError?: (e: { data: number }) => void;
      };
    },
  ) => YTPlayer;
}

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

const STATE = { ENDED: 0, PLAYING: 1, PAUSED: 2 } as const;
const FADE_MS = 2500;

let apiPromise: Promise<YTNamespace> | null = null;

/** Loads https://www.youtube.com/iframe_api once per page. */
function loadYouTubeApi(): Promise<YTNamespace> {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  apiPromise ??= new Promise<YTNamespace>((resolve, reject) => {
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      resolve(window.YT!);
    };
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    script.onerror = () => {
      apiPromise = null;
      script.remove();
      reject(new Error("YouTube player failed to load"));
    };
    document.head.append(script);
  });
  return apiPromise;
}

interface ClipOptions {
  videoId: string;
  start: number;
  end: number;
  /** Target volume, 0–100. */
  volume?: number;
}

/**
 * Mounts a YouTube player into `containerRef` (an empty element the caller renders) and keeps playback inside
 * [start, end), jumping back to `start` when it reaches `end`. start/end can
 * change while it plays (the trimmer drags them) without reloading the video.
 *
 * YouTube's terms require the player to stay visible while it plays, so callers
 * must render the container on screen.
 */
export function useYouTubeClip(
  containerRef: RefObject<HTMLDivElement | null>,
  { videoId, start, end, volume = 70 }: ClipOptions,
) {
  const playerRef = useRef<YTPlayer | null>(null);
  const bounds = useRef({ start, end });
  const pendingPlay = useRef<{ fade: boolean } | null>(null);
  const fadeRef = useRef<number | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [time, setTime] = useState(start);

  useEffect(() => {
    bounds.current = { start, end };
  }, [start, end]);

  const stopFade = () => {
    if (fadeRef.current) cancelAnimationFrame(fadeRef.current);
    fadeRef.current = null;
  };

  const startPlayback = useCallback(
    (player: YTPlayer, { fade }: { fade: boolean }) => {
      const t = player.getCurrentTime();
      if (t < bounds.current.start || t >= bounds.current.end) player.seekTo(bounds.current.start, true);
      stopFade();
      if (fade) {
        player.setVolume(0);
        const t0 = performance.now();
        const step = (now: number) => {
          const p = Math.min(1, (now - t0) / FADE_MS);
          playerRef.current?.setVolume(Math.round(volume * p));
          if (p < 1) fadeRef.current = requestAnimationFrame(step);
        };
        fadeRef.current = requestAnimationFrame(step);
      } else {
        player.setVolume(volume);
      }
      player.playVideo();
    },
    [volume],
  );

  // Create the player. YouTube replaces the element it's given with an iframe,
  // so hand it a child node that React doesn't manage.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let cancelled = false;
    setReady(false);
    setFailed(false);
    setPlaying(false);
    setDuration(0);

    const mount = document.createElement("div");
    container.append(mount);

    loadYouTubeApi().then(
      (YT) => {
        if (cancelled) return;
        playerRef.current = new YT.Player(mount, {
          host: "https://www.youtube-nocookie.com",
          videoId,
          width: "100%",
          height: "100%",
          playerVars: {
            start: Math.floor(bounds.current.start),
            controls: 0,
            disablekb: 1,
            fs: 0,
            playsinline: 1,
            rel: 0,
            iv_load_policy: 3,
          },
          events: {
            onReady: () => {
              const player = playerRef.current;
              if (cancelled || !player) return;
              setDuration(player.getDuration());
              setReady(true);
              if (pendingPlay.current) startPlayback(player, pendingPlay.current);
              pendingPlay.current = null;
            },
            onStateChange: ({ data }) => {
              const player = playerRef.current;
              if (!player) return;
              if (data === STATE.PLAYING) {
                setPlaying(true);
                setDuration((d) => d || player.getDuration());
              } else if (data === STATE.ENDED) {
                // Reached the end of the video itself: loop the clip.
                player.seekTo(bounds.current.start, true);
                player.playVideo();
              } else if (data === STATE.PAUSED) {
                setPlaying(false);
              }
            },
            onError: () => setFailed(true),
          },
        });
      },
      () => !cancelled && setFailed(true),
    );

    return () => {
      cancelled = true;
      stopFade();
      playerRef.current?.destroy();
      playerRef.current = null;
      container.replaceChildren();
    };
  }, [containerRef, videoId, startPlayback]);

  // Keep playback inside the clip and report progress.
  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => {
      const player = playerRef.current;
      if (!player) return;
      const t = player.getCurrentTime();
      const { start: s, end: e } = bounds.current;
      if (t >= e || t < s - 0.5) {
        player.seekTo(s, true);
        setTime(s);
      } else {
        setTime(t);
      }
    }, 200);
    return () => window.clearInterval(id);
  }, [playing]);

  /** Plays the clip. Call from a click handler so the browser allows sound. */
  const play = useCallback(
    ({ fade = false }: { fade?: boolean } = {}) => {
      const player = playerRef.current;
      if (player && ready) startPlayback(player, { fade });
      else pendingPlay.current = { fade };
    },
    [ready, startPlayback],
  );

  const pause = useCallback(() => {
    pendingPlay.current = null;
    stopFade();
    playerRef.current?.pauseVideo();
    setPlaying(false);
  }, []);

  /** Jumps to the start of the clip (used after the trimmer window moves). */
  const restart = useCallback(() => {
    playerRef.current?.seekTo(bounds.current.start, true);
    setTime(bounds.current.start);
  }, []);

  return { ready, failed, playing, duration, time, play, pause, restart };
}
