import "server-only";
import { cache } from "react";
import {
  MAX_FLOWERS,
  MAX_MESSAGE_LENGTH,
  MAX_NAME_LENGTH,
  getFlower,
  isFlowerId,
  isLetterTheme,
  isMusicTrackId,
  isVaseStyle,
} from "@/lib/catalog";
import { DB_SCHEMA, getSupabase, isSupabaseConfigured } from "@/lib/supabase/server";
import { MAX_VIDEO_SECONDS, isYouTubeId } from "@/lib/youtube";
import type { BouquetFlower, BouquetRecord, CreateBouquetInput } from "@/types/bouquet";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type NewBouquet = Omit<BouquetRecord, "id" | "created_at" | "youtube"> & {
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

  if (!sender || sender.length > MAX_NAME_LENGTH) return { ok: false, error: "Please add who it's from." };
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
      sender_name: sender,
      recipient_name: recipient,
      message,
      theme: i.theme,
      vase_style: i.vaseStyle,
      flowers,
      music: i.music ?? null,
      youtube,
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

export async function insertBouquet(bouquet: Omit<BouquetRecord, "id" | "created_at">): Promise<string> {
  if (shouldUseMemoryStore()) {
    warnOnce();
    const id = crypto.randomUUID();
    memory.set(id, { ...bouquet, id, created_at: new Date().toISOString() });
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
    .select("id, created_at, sender_name, recipient_name, message, theme, flowers, vase_style, music, youtube")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`Failed to load bouquet: ${error.message}`);
  return (data as BouquetRecord | null) ?? null;
});
