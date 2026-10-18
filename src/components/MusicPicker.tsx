"use client";

import { Check, Link2, Music, Pause, Play, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { MUSIC } from "@/lib/catalog";
import type { MusicTrack, MusicTrackId, YouTubeClip } from "@/types/bouquet";
import { YouTubeClipPicker } from "./YouTubeClipPicker";

interface MusicPickerProps {
  value: MusicTrackId | null;
  youtube: YouTubeClip | null;
  /** A letter has at most one music source, so both are always set together. */
  onChange: (next: { music: MusicTrackId | null; youtube: YouTubeClip | null }) => void;
}

export function MusicPicker({ value, youtube, onChange: onSourceChange }: MusicPickerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState<MusicTrackId | null>(null);
  // "Your own song" stays chosen while they paste a link, before a clip exists.
  const [ownSong, setOwnSong] = useState(youtube !== null);
  const onChange = (music: MusicTrackId | null) => {
    setOwnSong(false);
    onSourceChange({ music, youtube: null });
  };
  const noneSelected = value === null && !ownSong;

  const selectOwnSong = () => {
    audioRef.current?.pause();
    setPlaying(null);
    setOwnSong(true);
    onSourceChange({ music: null, youtube });
  };

  // Stop any preview when leaving the letter step.
  useEffect(() => () => audioRef.current?.pause(), []);

  const play = (id: MusicTrackId, audio: HTMLAudioElement) =>
    audio.play().then(
      () => setPlaying(id),
      () => setPlaying(null),
    );

  // Picking a new track plays it from its chorus.
  const select = (track: MusicTrack) => {
    onChange(track.id);
    const audio = (audioRef.current ??= new Audio());
    audio.src = `${track.src}#t=${track.chorusAt}`;
    audio.volume = 0.6;
    audio.onended = () => setPlaying(null);
    play(track.id, audio);
  };

  // Tapping the already-selected track pauses or resumes it.
  const toggle = (track: MusicTrack) => {
    const audio = audioRef.current;
    if (!audio) return select(track);
    if (playing === track.id) {
      audio.pause();
      setPlaying(null);
    } else {
      play(track.id, audio);
    }
  };

  const selectNone = () => {
    audioRef.current?.pause();
    setPlaying(null);
    onChange(null);
  };

  const optionClass = (selected: boolean) =>
    `flex min-w-0 cursor-pointer items-center gap-3 rounded-2xl border p-3 transition has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-sage-500 ${
      selected ? "border-sage-500 bg-sage-100" : "border-sage-100 bg-white/70 hover:border-sage-300"
    }`;

  return (
    <fieldset>
      <legend className="mb-1 font-display text-lg text-ink">Background music</legend>
      <p className="mb-3 text-sm text-ink-soft">
        Optional. It starts softly when they open your letter, and they can pause it anytime. Tap a song to
        hear it, and tap it again to pause. Or use your own song from YouTube and trim the part they hear.
      </p>

      <div className="grid gap-2 sm:grid-cols-2">
        <label className={optionClass(noneSelected)}>
          <input
            type="radio"
            name="letter-music"
            checked={noneSelected}
            onChange={selectNone}
            className="sr-only"
          />
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white text-ink-soft">
            <VolumeX className="size-4" aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-bold text-ink">No music</span>
            <span className="block text-xs text-ink-soft">Just the flowers and your words</span>
          </span>
          {noneSelected && <Check className="ml-auto size-4 shrink-0 text-sage-700" aria-hidden="true" />}
        </label>

        {MUSIC.map((track) => {
          const selected = value === track.id;
          const isPlaying = playing === track.id;
          const Icon = isPlaying ? Pause : selected ? Play : Music;
          return (
            <label key={track.id} className={optionClass(selected)}>
              <input
                type="radio"
                name="letter-music"
                checked={selected}
                onChange={() => select(track)}
                // onChange doesn't fire for an already-checked radio, so handle re-taps here.
                onClick={() => selected && toggle(track)}
                aria-label={`${track.title}${selected ? (isPlaying ? ", playing. Tap to pause" : ", paused. Tap to play") : ""}`}
                className="sr-only"
              />
              <span
                className={`grid size-9 shrink-0 place-items-center rounded-full ${
                  isPlaying ? "bg-blush-700 text-white" : "bg-blush-100 text-blush-700"
                }`}
              >
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-bold text-ink">{track.title}</span>
                <span className="block truncate text-xs text-ink-soft">
                  {track.subtitle} · {track.mood}
                </span>
              </span>
              {selected && <Check className="ml-auto size-4 shrink-0 text-sage-700" aria-hidden="true" />}
            </label>
          );
        })}

        <label className={optionClass(ownSong)}>
          <input type="radio" name="letter-music" checked={ownSong} onChange={selectOwnSong} className="sr-only" />
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-butter-100 text-ink">
            <Link2 className="size-4" aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-bold text-ink">Your own song</span>
            <span className="block truncate text-xs text-ink-soft">Paste a YouTube link and trim it</span>
          </span>
          {ownSong && <Check className="ml-auto size-4 shrink-0 text-sage-700" aria-hidden="true" />}
        </label>
      </div>

      {ownSong && (
        <div className="mt-3">
          <YouTubeClipPicker value={youtube} onChange={(clip) => onSourceChange({ music: null, youtube: clip })} />
        </div>
      )}
    </fieldset>
  );
}
