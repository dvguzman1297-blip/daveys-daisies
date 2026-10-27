import "server-only";
import { headers } from "next/headers";
import { hashIp } from "@/lib/email/tokens";
import { DB_SCHEMA, getSupabase, isSupabaseConfigured } from "@/lib/supabase/server";

export type LimitedAction = "create_bouquet" | "voice_upload" | "youtube_lookup";

const HOUR = 60 * 60 * 1000;

/** Requests allowed per IP per window. Much higher in `next dev` so testing isn't blocked. */
const LIMITS: Record<LimitedAction, { max: number; windowMs: number }> = {
  create_bouquet: { max: 20, windowMs: HOUR },
  voice_upload: { max: 20, windowMs: HOUR },
  youtube_lookup: { max: 60, windowMs: HOUR },
};
const DEV_MULTIPLIER = 50;

export const RATE_LIMITED_MESSAGE = "You're doing that a bit too fast. Please try again in a little while.";

/** The visitor's IP, from the proxy headers Vercel sets. Only ever stored as a keyed hash. */
export async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

const memory = ((globalThis as { __actionLog?: { action: string; ipHash: string; at: number }[] }).__actionLog ??= []);
const inMemoryMode = () => !isSupabaseConfigured() && process.env.NODE_ENV !== "production";

/**
 * Records a request and reports whether this visitor (by IP) is still under the limit.
 * Server Actions are public endpoints, so each one calls this before doing any work.
 * If the database can't be reached it lets the request through: a broken limiter
 * shouldn't take the whole site down.
 */
export async function checkRateLimit(action: LimitedAction): Promise<boolean> {
  const { max, windowMs } = LIMITS[action];
  const limit = process.env.NODE_ENV === "development" ? max * DEV_MULTIPLIER : max;
  const ipHash = hashIp(await clientIp());
  const since = Date.now() - windowMs;

  if (inMemoryMode()) {
    const used = memory.filter((r) => r.action === action && r.ipHash === ipHash && r.at >= since).length;
    if (used >= limit) return false;
    memory.push({ action, ipHash, at: Date.now() });
    return true;
  }

  try {
    const db = getSupabase().schema(DB_SCHEMA).from("action_log");
    const { count, error } = await db
      .select("id", { count: "exact", head: true })
      .eq("action", action)
      .eq("ip_hash", ipHash)
      .gte("created_at", new Date(since).toISOString());
    if (error) throw new Error(error.message);
    if ((count ?? 0) >= limit) return false;
    const { error: insertError } = await getSupabase()
      .schema(DB_SCHEMA)
      .from("action_log")
      .insert({ action, ip_hash: ipHash });
    if (insertError) throw new Error(insertError.message);
    return true;
  } catch (err) {
    console.error("[rate-limit] check failed, allowing the request:", err);
    return true;
  }
}
