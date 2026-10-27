import { timingSafeEqual } from "node:crypto";
import { DB_SCHEMA, getSupabase, isSupabaseConfigured } from "@/lib/supabase/server";
import { VOICE_BUCKET } from "@/lib/voice";

/** Uploads younger than this might belong to a letter that is still being written. */
const ORPHAN_AFTER_MS = 24 * 60 * 60 * 1000;
const LOG_KEEP_MS = 2 * 24 * 60 * 60 * 1000;
const PAGE = 100;

const authorized = (request: Request): boolean => {
  const secret = process.env.CRON_SECRET;
  if (!secret || secret.length < 16) return false;
  const given = Buffer.from(request.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${secret}`);
  return given.length === expected.length && timingSafeEqual(given, expected);
};

/**
 * Daily housekeeping (see vercel.json): deletes voice uploads that never got attached to a
 * letter, and rate-limit rows past the longest window. Vercel Cron sends CRON_SECRET as a bearer token.
 */
export async function GET(request: Request) {
  if (!authorized(request)) return new Response("Unauthorized", { status: 401 });
  if (!isSupabaseConfigured()) return Response.json({ skipped: "Supabase is not configured" });

  const supabase = getSupabase();
  const bucket = supabase.storage.from(VOICE_BUCKET);
  const cutoff = Date.now() - ORPHAN_AFTER_MS;

  // Every stored file, then the ones no bouquet points at.
  const old: string[] = [];
  for (let offset = 0; ; offset += PAGE) {
    const { data, error } = await bucket.list("voice", { limit: PAGE, offset });
    if (error) return new Response(`List failed: ${error.message}`, { status: 500 });
    for (const f of data) {
      if (f.created_at && new Date(f.created_at).getTime() < cutoff) old.push(`voice/${f.name}`);
    }
    if (data.length < PAGE) break;
  }

  const used = new Set<string>();
  for (let i = 0; i < old.length; i += PAGE) {
    const { data, error } = await supabase
      .schema(DB_SCHEMA)
      .from("bouquets")
      .select("voice_path")
      .in("voice_path", old.slice(i, i + PAGE));
    if (error) return new Response(`Lookup failed: ${error.message}`, { status: 500 });
    for (const row of data) used.add(row.voice_path as string);
  }
  const orphans = old.filter((p) => !used.has(p));
  for (let i = 0; i < orphans.length; i += PAGE) {
    const { error } = await bucket.remove(orphans.slice(i, i + PAGE));
    if (error) return new Response(`Delete failed: ${error.message}`, { status: 500 });
  }

  const { error: logError } = await supabase
    .schema(DB_SCHEMA)
    .from("action_log")
    .delete()
    .lt("created_at", new Date(Date.now() - LOG_KEEP_MS).toISOString());
  if (logError) return new Response(`Log cleanup failed: ${logError.message}`, { status: 500 });

  return Response.json({ deletedVoiceFiles: orphans.length });
}
