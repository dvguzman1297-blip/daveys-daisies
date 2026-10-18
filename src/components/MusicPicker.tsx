"use client";

import { Check, Music, Pause, Play, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { MUSIC } from "@/lib/catalog";
import type { MusicTrackId } from "@/types/bouquet";

interface MusicPickerProps {
  value: MusicTrackId | null;
  onChange: (music: MusicTrackId | null) => void;
}

export function MusicPicker({ value, onChange }: MusicPickerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [previewing, setPreviewing] = useState<MusicTrackId | null>(null);

  // Stop any preview when leaving the letter step.
  useEffect(() => () => audioRef.current?.pause(), []);

  const togglePreview = (id: MusicTrackId, src: string) => {
    const audio = (audioRef.current ??= new Audio());
    if (previewing === id) {
      audio.pause();
      setPreviewing(null);
      return;
    }
    audio.src = src;
    audio.volume = 0.6;
    audio.onended = () => setPreviewing(null);
    audio.play().then(
      () => setPreviewing(id),
      () => setPreviewing(null),
    );
  };

  const optionClass = (selected: boolean) =>
    `flex min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-2xl border p-3 transition has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-sage-500 ${
      selected ? "border-sage-500 bg-sage-100" : "border-sage-100 bg-white/70 hover:border-sage-300"
    }`;

  return (
    <fieldset>
      <legend className="mb-1 font-display text-lg text-ink">Background music</legend>
      <p className="mb-3 text-sm text-ink-soft">
        Optional. It starts softly when they open your letter, and they can pause it anytime.
      </p>

      <div className="grid gap-2 sm:grid-cols-2">
        <label className={optionClass(value === null)}>
          <input
            type="radio"
            name="letter-music"
            checked={value === null}
            onChange={() => onChange(null)}
            className="sr-only"
          />
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white text-ink-soft">
            <VolumeX className="size-4" aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-bold text-ink">No music</span>
            <span className="block text-xs text-ink-soft">Just the flowers and your words</span>
          </span>
          {value === null && <Check className="ml-auto size-4 shrink-0 text-sage-700" aria-hidden="true" />}
        </label>

        {MUSIC.map((track) => {
          const selected = value === track.id;
          const playing = previewing === track.id;
          return (
            <div key={track.id} className="flex items-stretch gap-2">
              <label className={optionClass(selected)}>
                <input
                  type="radio"
                  name="letter-music"
                  checked={selected}
                  onChange={() => onChange(track.id)}
                  className="sr-only"
                />
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-blush-100 text-blush-700">
                  <Music className="size-4" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-bold text-ink">{track.title}</span>
                  <span className="block truncate text-xs text-ink-soft">
                    {track.subtitle} · {track.mood}
                  </span>
                </span>
                {selected && <Check className="ml-auto size-4 shrink-0 text-sage-700" aria-hidden="true" />}
              </label>
              <button
                type="button"
                onClick={() => togglePreview(track.id, track.src)}
                aria-label={playing ? `Stop preview of ${track.title}` : `Preview ${track.title}`}
                aria-pressed={playing}
                className={`grid w-11 shrink-0 place-items-center rounded-2xl border transition focus-visible:outline-2 focus-visible:outline-sage-500 ${
                  playing
                    ? "border-blush-300 bg-blush-100 text-blush-700"
                    : "border-sage-100 bg-white/70 text-sage-700 hover:border-sage-300"
                }`}
              >
                {playing ? <Pause className="size-4" aria-hidden="true" /> : <Play className="size-4" aria-hidden="true" />}
              </button>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}
