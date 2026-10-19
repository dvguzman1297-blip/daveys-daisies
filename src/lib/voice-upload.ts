import { createVoiceUpload } from "@/app/voice-actions";
import type { VoiceDraft } from "@/types/bouquet";

/** Uploads a voice draft straight to storage and returns its path. */
export async function uploadVoice(draft: VoiceDraft): Promise<{ ok: true; path: string } | { ok: false; error: string }> {
  const failed = { ok: false, error: "We couldn't upload your voice message. Please try again." } as const;
  const res = await createVoiceUpload({ mime: draft.mime, bytes: draft.blob.size });
  if (!res.ok) return res;
  try {
    const put = await fetch(res.uploadUrl, { method: "PUT", headers: { "content-type": draft.mime }, body: draft.blob });
    return put.ok ? { ok: true, path: res.path } : failed;
  } catch {
    return failed;
  }
}
