import "server-only";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/server";
import { VOICE_BUCKET, voiceExtension } from "@/lib/voice";

/** How long the recipient's playback link stays valid after the page loads. */
const PLAYBACK_LINK_SECONDS = 6 * 60 * 60;

export const isVoiceStorageAvailable = () => isSupabaseConfigured();

/** A one-time URL the browser can PUT the audio to, so the file never passes through our server. */
export async function createVoiceUploadUrl(mime: string): Promise<{ path: string; uploadUrl: string }> {
  const ext = voiceExtension(mime);
  if (!ext) throw new Error("Unsupported audio type.");
  const path = `voice/${crypto.randomUUID()}.${ext}`;
  const { data, error } = await getSupabase().storage.from(VOICE_BUCKET).createSignedUploadUrl(path);
  if (error) throw new Error(`Failed to create upload URL: ${error.message}`);
  return { path, uploadUrl: data.signedUrl };
}

export async function voiceExists(path: string): Promise<boolean> {
  const { data, error } = await getSupabase().storage.from(VOICE_BUCKET).exists(path);
  return !error && data;
}

/**
 * Short-lived links to play and to download the voice message, or null if they can't be made
 * (the letter still opens without it). The download link makes the browser save the file
 * instead of playing it; the `download` attribute alone is ignored for cross-origin URLs.
 */
export async function signVoiceUrls(path: string): Promise<{ play: string; download: string } | null> {
  if (!isSupabaseConfigured()) return null;
  const bucket = getSupabase().storage.from(VOICE_BUCKET);
  const ext = path.split(".").pop();
  const [play, download] = await Promise.all([
    bucket.createSignedUrl(path, PLAYBACK_LINK_SECONDS),
    bucket.createSignedUrl(path, PLAYBACK_LINK_SECONDS, { download: `voice-message.${ext}` }),
  ]);
  if (play.error || download.error) {
    console.error(`Failed to sign voice message: ${(play.error ?? download.error)?.message}`);
    return null;
  }
  return { play: play.data.signedUrl, download: download.data.signedUrl };
}
