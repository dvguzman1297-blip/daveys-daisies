/** Shared YouTube helpers (safe for both server and client). */

export const CLIP_DEFAULT_SECONDS = 30;
/** Longest video we accept a clip from (12 hours), mostly to bound bad input. */
export const MAX_VIDEO_SECONDS = 12 * 60 * 60;

const ID_RE = /^[A-Za-z0-9_-]{11}$/;

export const isYouTubeId = (v: unknown): v is string => typeof v === "string" && ID_RE.test(v);

/**
 * Pulls the video id out of the link shapes people actually paste:
 * youtube.com/watch?v=, youtu.be/, /shorts/, /embed/, /live/ and music.youtube.com.
 */
export function parseYouTubeId(input: string): string | null {
  const text = input.trim();
  if (isYouTubeId(text)) return text;

  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(text) ? text : `https://${text}`);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^(www|m|music)\./, "");
  if (host === "youtu.be") {
    const id = url.pathname.slice(1).split("/")[0];
    return isYouTubeId(id) ? id : null;
  }
  if (host !== "youtube.com" && host !== "youtube-nocookie.com") return null;

  const v = url.searchParams.get("v");
  if (isYouTubeId(v)) return v;
  const [, kind, id] = url.pathname.split("/");
  return ["shorts", "embed", "live", "v"].includes(kind) && isYouTubeId(id) ? id : null;
}

/** 95 -> "1:35", 3725 -> "1:02:05" */
export function formatTime(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = String(s % 60).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${sec}` : `${m}:${sec}`;
}

export const youTubeThumbnail = (videoId: string) => `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;
export const youTubeWatchUrl = (videoId: string, start = 0) =>
  `https://www.youtube.com/watch?v=${videoId}${start ? `&t=${Math.floor(start)}s` : ""}`;
