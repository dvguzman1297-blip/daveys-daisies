"use client";

import { useEffect, useRef, type RefObject } from "react";
import { formatTime, youTubeWatchUrl } from "@/lib/youtube";
import { useYouTubeClip } from "@/lib/youtube-player";
import type { YouTubeClip } from "@/types/bouquet";
import { MusicPlayer } from "./LetterMusic";

interface YouTubeLetterMusicProps {
  clip: YouTubeClip;
  opened: boolean;
  /** Filled with a function that starts the clip; call it from the "open letter" click. */
  startRef: RefObject<(() => void) | null>;
  /** Filled with a function that pauses the clip for a voice message and resumes it afterwards. */
  duckRef: RefObject<((on: boolean) => void) | null>;
  /** True while a voice message plays, so the "play" pill stays hidden. */
  ducked: boolean;
}

/**
 * Plays the sender's trimmed YouTube clip on a loop. The player is created up
 * front so it's ready by the time the envelope is tapped, and stays hidden.
 */
export function YouTubeLetterMusic({ clip, opened, startRef, duckRef, ducked }: YouTubeLetterMusicProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const player = useYouTubeClip(containerRef, { videoId: clip.videoId, start: clip.start, end: clip.end, volume: 60 });
  const { play, pause, playing } = player;
  const resumeAfterVoice = useRef(false);

  useEffect(() => {
    startRef.current = () => play({ fade: true });
    return () => {
      startRef.current = null;
    };
  }, [play, startRef]);

  useEffect(() => {
    duckRef.current = (on) => {
      if (on && playing) {
        resumeAfterVoice.current = true;
        pause();
      } else if (!on && resumeAfterVoice.current) {
        resumeAfterVoice.current = false;
        play();
      }
    };
    return () => {
      duckRef.current = null;
    };
  }, [duckRef, playing, pause, play]);

  const credits = (
    <>
      {clip.title}
      {clip.author && ` by ${clip.author}`}, {formatTime(clip.start)}–{formatTime(clip.end)}.{" "}
      <a
        href={youTubeWatchUrl(clip.videoId, clip.start)}
        target="_blank"
        rel="noopener noreferrer"
        className="font-semibold text-blush-700 underline"
      >
        Watch on YouTube
      </a>
    </>
  );

  return (
    <>
      {opened && !player.playing && !ducked && (
        <MusicPlayer
          title={clip.title}
          credits={credits}
          playing={player.playing}
          onPlay={() => play()}
          onPause={player.pause}
        />
      )}
      {/* Audio only: the player is kept off-screen rather than shown. */}
      <div aria-hidden="true" className="pointer-events-none fixed -left-[9999px] top-0 h-[200px] w-[200px]">
        <div ref={containerRef} className="h-full w-full" />
      </div>
    </>
  );
}
