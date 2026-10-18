"use client";

import { Loader2, Pause, Play, Scissors, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState, useTransition, type KeyboardEvent, type PointerEvent } from "react";
import { lookupYouTube } from "@/app/actions";
import { CLIP_DEFAULT_SECONDS, formatTime } from "@/lib/youtube";
import { useYouTubeClip } from "@/lib/youtube-player";
import type { YouTubeClip } from "@/types/bouquet";

const BAR_COUNT = 72;
/** Shortest clip the handles allow, in seconds. */
const MIN_GAP = 5;

type DragMode = "move" | "start" | "end";

interface YouTubeClipPickerProps {
  value: YouTubeClip | null;
  onChange: (clip: YouTubeClip | null) => void;
}

/** Paste a YouTube link, then trim the part that plays, story-style. */
export function YouTubeClipPicker({ value, onChange }: YouTubeClipPickerProps) {
  const [link, setLink] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [looking, startLookup] = useTransition();

  const add = () => {
    setError(null);
    startLookup(async () => {
      const res = await lookupYouTube(link);
      if (!res.ok) return setError(res.error);
      setLink("");
      // end is provisional until the player reports the duration (see Trimmer).
      onChange({ videoId: res.videoId, title: res.title, author: res.author, start: 0, end: CLIP_DEFAULT_SECONDS });
    });
  };

  if (value) return <Trimmer key={value.videoId} clip={value} onChange={onChange} />;

  return (
    <div className="rounded-2xl border border-sage-100 bg-white/70 p-3">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (link.trim()) add();
        }}
        className="flex gap-2"
      >
        <label htmlFor="youtube-link" className="sr-only">
          YouTube link
        </label>
        <input
          id="youtube-link"
          type="url"
          inputMode="url"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="Paste a YouTube link"
          aria-invalid={!!error}
          aria-describedby={error ? "youtube-error" : "youtube-hint"}
          className="min-w-0 flex-1 rounded-xl border border-sage-100 bg-white px-3 py-2 text-sm text-ink outline-none transition placeholder:text-ink-soft/70 focus:border-sage-500"
        />
        <button
          type="submit"
          disabled={looking || !link.trim()}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-sage-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-sage-700/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-500 disabled:opacity-60"
        >
          {looking ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Scissors className="size-4" aria-hidden="true" />}
          Trim
        </button>
      </form>
      {error ? (
        <p id="youtube-error" role="alert" className="mt-2 text-xs font-semibold text-blush-700">
          {error}
        </p>
      ) : (
        <p id="youtube-hint" className="mt-2 text-xs text-ink-soft">
          Then choose where it starts and stops, or send the whole song. Spotify links aren&apos;t
          supported, so search the song on YouTube and paste that link.
        </p>
      )}
    </div>
  );
}

function Trimmer({ clip, onChange }: { clip: YouTubeClip; onChange: (clip: YouTubeClip | null) => void }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const player = useYouTubeClip(containerRef, { videoId: clip.videoId, start: clip.start, end: clip.end });
  const { duration } = player;
  const stripRef = useRef<HTMLDivElement | null>(null);
  const drag = useRef<{ mode: DragMode; x: number; start: number; end: number } | null>(null);
  const [dragging, setDragging] = useState(false);

  const length = clip.end - clip.start;
  const total = Math.floor(duration);
  const minGap = Math.min(MIN_GAP, total);
  const tenth = (n: number) => Math.round(n * 10) / 10;
  const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(n, hi));

  const setRange = (start: number, end: number) => onChange({ ...clip, start: tenth(start), end: tenth(end) });
  /** Slides the whole window, keeping its length. */
  const setStart = (start: number, len = length) => {
    const st = clamp(start, 0, total - len);
    setRange(st, st + len);
  };

  // Once the real length is known, fit the clip and start it ~a quarter in,
  // where many songs reach their first chorus. The sender then drags from there.
  const fitted = useRef(false);
  useEffect(() => {
    if (!duration || fitted.current) return;
    fitted.current = true;
    const len = Math.min(CLIP_DEFAULT_SECONDS, duration);
    const isFresh = clip.start === 0 && clip.end === CLIP_DEFAULT_SECONDS;
    const start = isFresh ? Math.round(duration * 0.25) : clip.start;
    const s = Math.max(0, Math.min(start, duration - (isFresh ? len : clip.end - clip.start)));
    const e = isFresh ? s + len : Math.min(clip.end, duration);
    if (s !== clip.start || e !== clip.end) onChange({ ...clip, start: s, end: e });
  }, [duration, clip, onChange]);

  const secondsPerPixel = () => duration / (stripRef.current?.clientWidth || 1);

  // Tapping empty track centers the window there; grabbing the window slides it.
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!duration) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const rect = e.currentTarget.getBoundingClientRect();
    const at = ((e.clientX - rect.left) / rect.width) * duration;
    let start = clip.start;
    if (at < clip.start || at > clip.end) {
      start = clamp(at - length / 2, 0, total - length);
      setStart(start);
    }
    drag.current = { mode: "move", x: e.clientX, start, end: start + length };
    setDragging(true);
    player.pause();
  };

  // Grabbing a handle moves only that edge of the window.
  const grabHandle = (mode: "start" | "end") => (e: PointerEvent<HTMLElement>) => {
    if (!duration) return;
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { mode, x: e.clientX, start: clip.start, end: clip.end };
    setDragging(true);
    player.pause();
  };

  // Move/up events from a captured handle bubble up to the strip, so one pair of handlers serves all three.
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const dt = (e.clientX - d.x) * secondsPerPixel();
    if (d.mode === "move") setStart(d.start + dt, d.end - d.start);
    else if (d.mode === "start") setRange(clamp(d.start + dt, 0, d.end - minGap), d.end);
    else setRange(d.start, clamp(d.end + dt, d.start + minGap, total));
  };

  const endDrag = () => {
    if (!drag.current) return;
    drag.current = null;
    setDragging(false);
    // Play from the new spot, like Instagram does when you let go.
    player.restart();
    player.play();
  };

  const nudge = (mode: "start" | "end", e: KeyboardEvent<HTMLElement>) => {
    const step = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1, PageDown: -10, PageUp: 10 }[e.key];
    if (!step) return;
    e.preventDefault();
    if (mode === "start") setRange(clamp(clip.start + step, 0, clip.end - minGap), clip.end);
    else setRange(clip.start, clamp(clip.end + step, clip.start + minGap, total));
  };

  const bars = useMemo(() => fakeWaveform(clip.videoId), [clip.videoId]);
  const pct = (s: number) => (duration ? (s / duration) * 100 : 0);

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-sage-500 bg-sage-100 p-3">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-ink">{clip.title}</p>
          <p className="truncate text-xs text-ink-soft">{clip.author}</p>
        </div>
        <button
          type="button"
          onClick={() => onChange(null)}
          className="inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-xs font-bold text-ink-soft transition hover:bg-white focus-visible:outline-2 focus-visible:outline-sage-500"
        >
          <X className="size-3.5" aria-hidden="true" />
          Change song
        </button>
      </div>

      {/* YouTube requires the player to be visible while it plays. */}
      <div className="relative mx-auto aspect-video w-full max-w-sm overflow-hidden rounded-xl bg-ink/10">
        <div ref={containerRef} className="absolute inset-0" />
        {!player.ready && !player.failed && (
          <Loader2 className="absolute inset-0 m-auto size-6 animate-spin text-ink-soft" aria-hidden="true" />
        )}
      </div>

      {player.failed ? (
        <p role="alert" className="text-xs font-semibold text-blush-700">
          This video won&apos;t play here. Try another link.
        </p>
      ) : (
        <>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => (player.playing ? player.pause() : player.play())}
              disabled={!player.ready}
              aria-label={player.playing ? "Pause clip" : "Play clip"}
              className="grid size-10 shrink-0 place-items-center rounded-full bg-blush-700 text-white transition hover:bg-blush-700/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blush-500 disabled:opacity-50"
            >
              {player.playing ? <Pause className="size-4" aria-hidden="true" /> : <Play className="size-4" aria-hidden="true" />}
            </button>

            <div
              ref={stripRef}
              role="group"
              aria-label="Part of the song to play"
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              className={`relative h-14 min-w-0 flex-1 touch-none select-none rounded-xl bg-white/80 ${
                duration ? (dragging ? "cursor-grabbing" : "cursor-grab") : "animate-pulse"
              }`}
            >
              <div className="absolute inset-x-2 inset-y-2 flex items-center gap-[2px]" aria-hidden="true">
                {bars.map((h, i) => {
                  const t = ((i + 0.5) / BAR_COUNT) * duration;
                  const inside = duration > 0 && t >= clip.start && t <= clip.end;
                  return (
                    <span
                      key={i}
                      className={`flex-1 rounded-full transition-colors ${inside ? "bg-blush-500" : "bg-sage-300"}`}
                      style={{ height: `${h}%` }}
                    />
                  );
                })}
              </div>
              {duration > 0 && (
                <div
                  className="pointer-events-none absolute inset-y-0 rounded-xl border-[3px] border-blush-700 bg-blush-500/10"
                  style={{ left: `${pct(clip.start)}%`, width: `${pct(length)}%` }}
                >
                  {player.playing && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-y-1 w-0.5 rounded-full bg-ink/70"
                      style={{ left: `${Math.min(100, ((player.time - clip.start) / length) * 100)}%` }}
                    />
                  )}
                  {(["start", "end"] as const).map((edge) => (
                    <span
                      key={edge}
                      role="slider"
                      tabIndex={0}
                      aria-label={edge === "start" ? "Where the song starts" : "Where the song stops"}
                      aria-orientation="horizontal"
                      aria-valuemin={edge === "start" ? 0 : Math.ceil(clip.start + minGap)}
                      aria-valuemax={edge === "start" ? Math.floor(clip.end - minGap) : total}
                      aria-valuenow={Math.round(edge === "start" ? clip.start : clip.end)}
                      aria-valuetext={formatTime(edge === "start" ? clip.start : clip.end)}
                      onPointerDown={grabHandle(edge)}
                      onKeyDown={(e) => {
                        e.stopPropagation();
                        nudge(edge, e);
                      }}
                      onKeyUp={(e) => (e.key.startsWith("Arrow") || e.key.startsWith("Page") ? player.restart() : undefined)}
                      className={`pointer-events-auto absolute inset-y-0 grid w-6 cursor-ew-resize place-items-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-500 ${
                        edge === "start" ? "-left-[3px] rounded-l-xl" : "-right-[3px] rounded-r-xl"
                      }`}
                    >
                      <span aria-hidden="true" className="h-6 w-1.5 rounded-full bg-blush-700" />
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs text-ink-soft">
            <span className="font-semibold tabular-nums text-ink">
              {duration ? `${formatTime(clip.start)} – ${formatTime(clip.end)}` : "Loading song…"}
            </span>
            {duration > 0 && <span className="tabular-nums">{formatTime(length)} of {formatTime(duration)}</span>}
          </div>
          <p className="text-xs text-ink-soft">
            Drag the pink handles to choose where it starts and stops, or drag the middle to slide the whole window.
            Pull the handles all the way out to send the entire song. It plays on a loop when they open your letter.
          </p>
        </>
      )}
    </div>
  );
}

/**
 * YouTube doesn't let websites read a video's audio, so the waveform is
 * decorative: stable per video, but not the song's real loudness.
 */
function fakeWaveform(seed: string): number[] {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  const rand = () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return ((h >>> 0) % 1000) / 1000;
  };
  return Array.from({ length: BAR_COUNT }, (_, i) => {
    const swell = 0.55 + 0.45 * Math.sin((i / BAR_COUNT) * Math.PI * 3 + 1);
    return Math.round(20 + 80 * swell * (0.45 + 0.55 * rand()));
  });
}
