"use server";

import { MAX_VOICE_BYTES, voiceExtension } from "@/lib/voice";
import { createVoiceUploadUrl, isVoiceStorageAvailable } from "@/lib/voice-storage";

export type CreateVoiceUploadResult =
  | { ok: true; path: string; uploadUrl: string }
  | { ok: false; error: string };

/**
 * Hands the browser a signed URL to upload one voice message to private storage.
 * Server Actions have small body limits, so the audio goes straight to Supabase;
 * the bucket itself enforces the size cap and the allowed audio types.
 * Like createBouquet this is publicly reachable: add rate limiting before a public launch.
 */
export async function createVoiceUpload(input: { mime: unknown; bytes: unknown }): Promise<CreateVoiceUploadResult> {
  const mime = typeof input?.mime === "string" ? input.mime : "";
  const bytes = input?.bytes;
  if (!voiceExtension(mime)) return { ok: false, error: "That audio format isn't supported." };
  if (typeof bytes !== "number" || !Number.isFinite(bytes) || bytes < 1 || bytes > MAX_VOICE_BYTES) {
    return { ok: false, error: "That recording is too large. Voice messages can be up to 10 MB." };
  }
  if (!isVoiceStorageAvailable()) {
    return { ok: false, error: "Voice messages need Supabase storage to be set up." };
  }
  try {
    return { ok: true, ...(await createVoiceUploadUrl(mime)) };
  } catch (err) {
    console.error(err);
    return { ok: false, error: "We couldn't upload your voice message. Please try again." };
  }
}
