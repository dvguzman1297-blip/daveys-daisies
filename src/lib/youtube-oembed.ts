import "server-only";
import { youTubeWatchUrl } from "@/lib/youtube";

export interface YouTubeInfo {
  title: string;
  author: string;
}

/**
 * Looks a video up through YouTube's public oEmbed endpoint (no API key).
 * Returns null when the video doesn't exist, is private, or has embedding
 * turned off — all cases where the recipient couldn't play it anyway.
 */
export async function fetchYouTubeInfo(videoId: string): Promise<YouTubeInfo | null> {
  const url = `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(youTubeWatchUrl(videoId))}`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    const data = (await res.json()) as { title?: unknown; author_name?: unknown };
    if (typeof data.title !== "string") return null;
    return {
      title: data.title.slice(0, 200),
      author: typeof data.author_name === "string" ? data.author_name.slice(0, 100) : "",
    };
  } catch {
    return null;
  }
}
