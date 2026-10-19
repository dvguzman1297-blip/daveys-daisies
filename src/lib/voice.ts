/** Shared by the browser (recorder, upload) and the server (validation). */

export const MAX_VOICE_SECONDS = 120;
export const MAX_VOICE_BYTES = 10 * 1024 * 1024;
/** Private Supabase Storage bucket (created in supabase/migrations). */
export const VOICE_BUCKET = "voice-messages";

/** Audio types we accept -> the file extension used in storage. */
const VOICE_EXTENSIONS: Record<string, string> = {
  "audio/webm": "webm",
  "audio/ogg": "ogg",
  "audio/mp4": "m4a",
  "audio/x-m4a": "m4a",
  "audio/aac": "aac",
  "audio/mpeg": "mp3",
  "audio/wav": "wav",
  "audio/x-wav": "wav",
};

/** Some systems report no type for a picked file, so fall back to its extension. */
const EXTENSION_MIME: Record<string, string> = {
  webm: "audio/webm",
  ogg: "audio/ogg",
  oga: "audio/ogg",
  opus: "audio/ogg",
  m4a: "audio/mp4",
  mp4: "audio/mp4",
  aac: "audio/aac",
  mp3: "audio/mpeg",
  wav: "audio/wav",
};

export const VOICE_PATH_RE = /^voice\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(webm|ogg|m4a|aac|mp3|wav)$/;

/** "audio/webm;codecs=opus" -> "audio/webm" */
export const normalizeVoiceMime = (type: string) => type.split(";")[0].trim().toLowerCase();

export const voiceExtension = (mime: string): string | null => VOICE_EXTENSIONS[normalizeVoiceMime(mime)] ?? null;

/** The audio type of a picked file, or null if it isn't a format we accept. */
export function voiceMimeOfFile(file: { name: string; type: string }): string | null {
  const byType = normalizeVoiceMime(file.type);
  if (byType in VOICE_EXTENSIONS) return byType;
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  return EXTENSION_MIME[ext] ?? null;
}
