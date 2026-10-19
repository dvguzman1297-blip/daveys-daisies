"use client";

import { Download, Mic, Pause, Play } from "lucide-react";
import { useRef, useState } from "react";
import { formatTime } from "@/lib/youtube";

interface VoiceMessagePlayerProps {
  src: string;
  /** Same file, served so the browser saves it instead of playing it. */
  downloadUrl: string;
  /** Length recorded by the sender; used until the browser reports the real one. */
  seconds: number;
  title: string;
  /** Lets the page quiet the background music while the voice plays. */
  onPlayingChange: (playing: boolean) => void;
}

/** Tap-to-play card for the sender's voice message. Never autoplays. */
export function VoiceMessagePlayer({ src, downloadUrl, seconds, title, onPlayingChange }: VoiceMessagePlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(seconds);
  const [failed, setFailed] = useState(false);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) audio.pause();
    else audio.play().catch(() => setFailed(true));
  };

  const seek = (to: number) => {
    if (audioRef.current) audioRef.current.currentTime = to;
    setTime(to);
  };

  const setPlayingState = (next: boolean) => {
    setPlaying(next);
    onPlayingChange(next);
  };

  return (
    <div className="mt-5 flex items-center gap-3 rounded-2xl border border-sage-100 bg-white/90 p-3 shadow-soft">
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onPlay={() => setPlayingState(true)}
        onPause={() => setPlayingState(false)}
        onEnded={() => setTime(0)}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => {
          const d = e.currentTarget.duration;
          if (Number.isFinite(d) && d > 0) setDuration(d);
        }}
        onError={() => setFailed(true)}
      />
      <button
        type="button"
        onClick={toggle}
        disabled={failed}
        aria-label={playing ? "Pause voice message" : "Play voice message"}
        className="grid size-11 shrink-0 place-items-center rounded-full bg-blush-700 text-white transition hover:bg-blush-700/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blush-500 disabled:opacity-40"
      >
        {playing ? <Pause className="size-5" aria-hidden="true" /> : <Play className="size-5" aria-hidden="true" />}
      </button>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 truncate text-sm font-bold text-ink">
          <Mic className="size-3.5 shrink-0 text-blush-700" aria-hidden="true" />
          <span className="truncate">{title}</span>
        </p>
        {failed ? (
          <p role="alert" className="text-xs font-semibold text-blush-700">
            Sorry, the voice message couldn&apos;t be played.
          </p>
        ) : (
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={0}
              max={duration}
              step={0.1}
              value={Math.min(time, duration)}
              onChange={(e) => seek(Number(e.target.value))}
              aria-label="Voice message position"
              className="h-1.5 min-w-0 flex-1 accent-blush-700"
            />
            <span className="shrink-0 text-xs tabular-nums text-ink-soft">
              {formatTime(time)} / {formatTime(duration)}
            </span>
          </div>
        )}
      </div>
      <a
        href={downloadUrl}
        download
        aria-label="Download voice message"
        title="Download"
        className="grid size-9 shrink-0 place-items-center rounded-full text-sage-700 transition hover:bg-sage-100 focus-visible:outline-2 focus-visible:outline-sage-500"
      >
        <Download className="size-5" aria-hidden="true" />
      </a>
    </div>
  );
}
