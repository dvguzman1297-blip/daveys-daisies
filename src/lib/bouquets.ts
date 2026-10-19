import "server-only";
import { cache } from "react";
import {
  ANONYMOUS_SIGNATURE,
  MAX_FLOWERS,
  MAX_MESSAGE_LENGTH,
  MAX_NAME_LENGTH,
  getFlower,
  isFlowerId,
  isLetterTheme,
  isMusicTrackId,
  isVaseStyle,
} from "@/lib/catalog";
import { normalizeEmail } from "@/lib/email/address";
import { rememberRecipientInMemory } from "@/lib/email/store";
import { DB_SCHEMA, getSupabase, isSupabaseConfigured } from "@/lib/supabase/server";
import { MAX_VOICE_SECONDS, VOICE_PATH_RE } from "@/lib/voice";
import { MAX_VIDEO_SECONDS, isYouTubeId } from "@/lib/youtube";
import type { BouquetFlower, BouquetRecord, CreateBouquetInput } from "@/types/bouquet";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type NewBouquet = Omit<BouquetRecord, "id" | "created_at" | "youtube"> & {
  /** Private: kept for the Report/Block link, never returned to browsers. */
  recipient_email: string | null;
  /** Title and author are filled in from YouTube by the caller, never trusted from the client. */
  youtube: CreateBouquetInput["youtube"];
};

const isSeconds = (v: unknown): v is number =>
  typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= MAX_VIDEO_SECONDS;

/**
 * Validates untrusted input from the client. Server Actions are plain POST
 * endpoints, so nothing from the browser is trusted: flower names are looked
 * up from the catalog, and every limit is re-checked here (and again by the
 * CHECK constraints in the database).
 */
export function validateBouquet(input: unknown): { ok: true; value: NewBouquet } | { ok: false; error: string } {
  if (!input || typeof input !== "object") return { ok: false, error: "Invalid request." };
  const i = input as Partial<CreateBouquetInput>;

  const sender = typeof i.senderName === "string" ? i.senderName.trim() : "";
  const recipient = typeof i.recipientName === "string" ? i.recipientName.trim() : "";
  const message = typeof i.message === "string" ? i.message.trim() : "";

  const anonymous = i.anonymous === true;
  if ((!anonymous && !sender) || sender.length > MAX_NAME_LENGTH) return { ok: false, error: "Please add who it's from." };
  if (!recipient || recipient.length > MAX_NAME_LENGTH) return { ok: false, error: "Please add who it's for." };
  if (!message || message.length > MAX_MESSAGE_LENGTH) return { ok: false, error: `Please write a letter (up to ${MAX_MESSAGE_LENGTH} characters).` };
  if (!isLetterTheme(i.theme)) return { ok: false, error: "Unknown letter theme." };
  if (!isVaseStyle(i.vaseStyle)) return { ok: false, error: "Unknown vase style." };
  if (i.music != null && !isMusicTrackId(i.music)) return { ok: false, error: "Unknown music track." };
  let youtube: NewBouquet["youtube"] = null;
  if (i.youtube != null) {
    const { videoId, start, end } = i.youtube;
    // The client keeps clips at 15s or more; 1s is the floor for videos shorter than that.
    if (!isYouTubeId(videoId) || !isSeconds(start) || !isSeconds(end)) {
      return { ok: false, error: "That YouTube clip looks off. Please pick it again." };
    }
    // Round to tenths first: 9.1 + 60 - 9.1 isn't exactly 60 in floating point.
    const s = Math.round(start * 10) / 10;
    const e = Math.round(end * 10) / 10;
    const length = Math.round((e - s) * 10) / 10;
    if (length < 1 || length > MAX_VIDEO_SECONDS) {
      return { ok: false, error: "That YouTube clip looks off. Please pick it again." };
    }
    if (i.music != null) return { ok: false, error: "Pick either a song from the list or a YouTube clip." };
    youtube = { videoId, start: s, end: e };
  }
  let voicePath: string | null = null;
  let voiceSeconds: number | null = null;
  if (i.voice != null) {
    const { path, seconds } = i.voice;
    if (typeof path !== "string" || !VOICE_PATH_RE.test(path)) return { ok: false, error: "That voice message looks off. Please add it again." };
    if (typeof seconds !== "number" || !Number.isFinite(seconds) || seconds <= 0 || seconds > MAX_VOICE_SECONDS) {
      return { ok: false, error: `Voice messages can be up to ${MAX_VOICE_SECONDS / 60} minutes.` };
    }
    voicePath = path;
    voiceSeconds = Math.max(1, Math.round(seconds));
  }
  let recipientEmail: string | null = null;
  if (typeof i.recipientEmail === "string" && i.recipientEmail.trim() !== "") {
    recipientEmail = normalizeEmail(i.recipientEmail);
    if (!recipientEmail) return { ok: false, error: "That email address doesn't look right." };
  }
  if (!Array.isArray(i.flowers)) return { ok: false, error: "Invalid flowers." };

  const merged = new Map<string, BouquetFlower>();
  for (const f of i.flowers) {
    if (!f || !isFlowerId(f.id) || !Number.isInteger(f.count) || f.count < 1) {
      return { ok: false, error: "Invalid flowers." };
    }
    const existing = merged.get(f.id);
    merged.set(f.id, { id: f.id, name: getFlower(f.id).name, count: (existing?.count ?? 0) + f.count });
  }
  const flowers = [...merged.values()];
  const total = flowers.reduce((s, f) => s + f.count, 0);
  if (total < 1) return { ok: false, error: "Add at least one flower." };
  if (total > MAX_FLOWERS) return { ok: false, error: `A bouquet can hold up to ${MAX_FLOWERS} flowers.` };

  return {
    ok: true,
    value: {
      sender_name: sender || ANONYMOUS_SIGNATURE,
      recipient_name: recipient,
      message,
      theme: i.theme,
      vase_style: i.vaseStyle,
      flowers,
      music: i.music ?? null,
      youtube,
      anonymous,
      voice_path: voicePath,
      voice_seconds: voiceSeconds,
      recipient_email: recipientEmail,
    },
  };
}

// ---------------------------------------------------------------------------
// Local development fallback: if Supabase env vars are missing (and we're not
// in production), keep bouquets in memory so the app is fully clickable before
// the database is wired up. Data is lost on server restart.
// ---------------------------------------------------------------------------
const memory = ((globalThis as { __bouquets?: Map<string, BouquetRecord> }).__bouquets ??= new Map());
const shouldUseMemoryStore = () => !isSupabaseConfigured() && process.env.NODE_ENV !== "production";
let warned = false;
const warnOnce = () => {
  if (!warned) console.warn("[bouquets] Supabase not configured — using in-memory dev store.");
  warned = true;
};

export async function insertBouquet(
  bouquet: Omit<BouquetRecord, "id" | "created_at"> & { recipient_email: string | null },
): Promise<string> {
  if (shouldUseMemoryStore()) {
    warnOnce();
    const id = crypto.randomUUID();
    const { recipient_email, ...record } = bouquet;
    memory.set(id, { ...record, id, created_at: new Date().toISOString() });
    rememberRecipientInMemory(id, recipient_email);
    return id;
  }

  const { data, error } = await getSupabase().schema(DB_SCHEMA).from("bouquets").insert(bouquet).select("id").single();
  if (error) throw new Error(`Failed to save bouquet: ${error.message}`);
  return data.id as string;
}

/** Fetch one bouquet by id. Wrapped in React `cache` so metadata + page share one query. */
export const getBouquet = cache(async (id: string): Promise<BouquetRecord | null> => {
  if (!UUID_RE.test(id)) return null;

  if (shouldUseMemoryStore()) {
    warnOnce();
    return memory.get(id) ?? null;
  }

  const { data, error } = await getSupabase()
    .schema(DB_SCHEMA)
    .from("bouquets")
    // recipient_email is deliberately not selected: it must never reach the page or the browser.
    .select("id, created_at, sender_name, recipient_name, message, theme, flowers, vase_style, music, youtube, anonymous, voice_path, voice_seconds, reported_at")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`Failed to load bouquet: ${error.message}`);
  if (!data || data.reported_at) return null; // reported letters are treated as gone
  const { reported_at: _reported, ...bouquet } = data;
  void _reported;
  return bouquet as BouquetRecord;
});
