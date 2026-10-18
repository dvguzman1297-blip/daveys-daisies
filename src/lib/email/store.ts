import "server-only";
import { DB_SCHEMA, getSupabase, isSupabaseConfigured } from "@/lib/supabase/server";

/**
 * Database access for emailing: the block list, the send log used for rate
 * limiting, and the per-bouquet email fields. Like the bouquets store, it falls
 * back to memory in local development when Supabase isn't configured.
 */

interface MemoryState {
  blocks: Set<string>;
  sends: { bouquetId: string; ipHash: string; recipientHash: string; at: number }[];
  info: Map<string, { recipientEmail: string | null; sent: boolean }>;
}
const memory: MemoryState = ((globalThis as { __emailMemory?: MemoryState }).__emailMemory ??= {
  blocks: new Set(),
  sends: [],
  info: new Map(),
});
const inMemoryMode = () => !isSupabaseConfigured() && process.env.NODE_ENV !== "production";
const db = () => getSupabase().schema(DB_SCHEMA);

export async function isBlocked(emailHash: string): Promise<boolean> {
  if (inMemoryMode()) return memory.blocks.has(emailHash);
  const { data, error } = await db().from("email_blocks").select("email_hash").eq("email_hash", emailHash).maybeSingle();
  if (error) throw new Error(`Block lookup failed: ${error.message}`);
  return !!data;
}

export async function addBlock(emailHash: string): Promise<void> {
  if (inMemoryMode()) {
    memory.blocks.add(emailHash);
    return;
  }
  const { error } = await db().from("email_blocks").upsert({ email_hash: emailHash }, { onConflict: "email_hash", ignoreDuplicates: true });
  if (error) throw new Error(`Block failed: ${error.message}`);
}

/** How many emails this sender (by IP hash) and this recipient have been sent since `since`. */
export async function countRecentSends(ipHash: string, recipientHash: string, since: Date) {
  if (inMemoryMode()) {
    const recent = memory.sends.filter((s) => s.at >= since.getTime());
    return {
      byIp: recent.filter((s) => s.ipHash === ipHash).length,
      byRecipient: recent.filter((s) => s.recipientHash === recipientHash).length,
    };
  }
  const count = async (column: "ip_hash" | "recipient_hash", value: string) => {
    const { count: n, error } = await db()
      .from("email_sends")
      .select("id", { count: "exact", head: true })
      .eq(column, value)
      .gte("created_at", since.toISOString());
    if (error) throw new Error(`Send count failed: ${error.message}`);
    return n ?? 0;
  };
  const [byIp, byRecipient] = await Promise.all([count("ip_hash", ipHash), count("recipient_hash", recipientHash)]);
  return { byIp, byRecipient };
}

export async function logSend(bouquetId: string, ipHash: string, recipientHash: string): Promise<void> {
  if (inMemoryMode()) {
    memory.sends.push({ bouquetId, ipHash, recipientHash, at: Date.now() });
    return;
  }
  const { error } = await db().from("email_sends").insert({ bouquet_id: bouquetId, ip_hash: ipHash, recipient_hash: recipientHash });
  if (error) throw new Error(`Send log failed: ${error.message}`);
}

export async function markEmailSent(bouquetId: string): Promise<void> {
  if (inMemoryMode()) {
    const info = memory.info.get(bouquetId);
    if (info) info.sent = true;
    return;
  }
  const { error } = await db().from("bouquets").update({ email_sent_at: new Date().toISOString() }).eq("id", bouquetId);
  if (error) throw new Error(`Marking email sent failed: ${error.message}`);
}

/** The private email fields of a bouquet (never part of the public bouquet record). */
export async function getEmailInfo(bouquetId: string): Promise<{ recipientEmail: string | null; sent: boolean } | null> {
  if (inMemoryMode()) return memory.info.get(bouquetId) ?? null;
  const { data, error } = await db().from("bouquets").select("recipient_email, email_sent_at").eq("id", bouquetId).maybeSingle();
  if (error) throw new Error(`Email info lookup failed: ${error.message}`);
  return data ? { recipientEmail: data.recipient_email as string | null, sent: !!data.email_sent_at } : null;
}

/** Remembers a new bouquet's recipient address. Only needed in memory mode; the database stores it with the row. */
export function rememberRecipientInMemory(bouquetId: string, recipientEmail: string | null) {
  memory.info.set(bouquetId, { recipientEmail, sent: false });
}

/** Hides a reported letter from everyone. */
export async function markReported(bouquetId: string): Promise<void> {
  if (inMemoryMode()) {
    (globalThis as { __bouquets?: Map<string, unknown> }).__bouquets?.delete(bouquetId);
    return;
  }
  const { error } = await db().from("bouquets").update({ reported_at: new Date().toISOString() }).eq("id", bouquetId);
  if (error) throw new Error(`Report failed: ${error.message}`);
}
