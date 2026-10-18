"use server";

import { insertBouquet, validateBouquet } from "@/lib/bouquets";
import { parseYouTubeId } from "@/lib/youtube";
import { fetchYouTubeInfo } from "@/lib/youtube-oembed";
import type { CreateBouquetInput, CreateBouquetResult } from "@/types/bouquet";

const UNPLAYABLE = "We couldn't find that video, or its owner doesn't allow it to play on other sites. Try another link.";

/**
 * Creates a bouquet and returns its id (the share slug).
 * Note: Server Actions are publicly reachable POST endpoints. Anonymous creation
 * is intended here, so input is validated strictly; add rate limiting (e.g.
 * Vercel Firewall rules or Upstash) before a public launch.
 */
export async function createBouquet(input: CreateBouquetInput): Promise<CreateBouquetResult> {
  const result = validateBouquet(input);
  if (!result.ok) return result;
  const { youtube, ...rest } = result.value;

  let clip = null;
  if (youtube) {
    // Re-check with YouTube: it may have been removed or had embedding disabled since it was picked.
    const info = await fetchYouTubeInfo(youtube.videoId);
    if (!info) return { ok: false, error: UNPLAYABLE };
    clip = { ...youtube, ...info };
  }

  try {
    const id = await insertBouquet({ ...rest, youtube: clip });
    return { ok: true, id };
  } catch (err) {
    console.error(err);
    return { ok: false, error: "We couldn't save your bouquet. Please try again." };
  }
}

export type LookupYouTubeResult =
  | { ok: true; videoId: string; title: string; author: string }
  | { ok: false; error: string };

/** Resolves a pasted YouTube link to its video id and title for the clip picker. */
export async function lookupYouTube(link: unknown): Promise<LookupYouTubeResult> {
  if (typeof link !== "string" || link.length > 500) return { ok: false, error: "Paste a YouTube link." };
  if (/spotify\.com|spotify:/i.test(link)) {
    return { ok: false, error: "Spotify links can't be trimmed here. Paste the same song from YouTube instead." };
  }
  const videoId = parseYouTubeId(link);
  if (!videoId) return { ok: false, error: "That doesn't look like a YouTube link." };

  const info = await fetchYouTubeInfo(videoId);
  if (!info) return { ok: false, error: UNPLAYABLE };
  return { ok: true, videoId, ...info };
}
