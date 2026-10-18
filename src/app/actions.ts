"use server";

import { insertBouquet, validateBouquet } from "@/lib/bouquets";
import type { CreateBouquetInput, CreateBouquetResult } from "@/types/bouquet";

/**
 * Creates a bouquet and returns its id (the share slug).
 * Note: Server Actions are publicly reachable POST endpoints. Anonymous creation
 * is intended here, so input is validated strictly; add rate limiting (e.g.
 * Vercel Firewall rules or Upstash) before a public launch.
 */
export async function createBouquet(input: CreateBouquetInput): Promise<CreateBouquetResult> {
  const result = validateBouquet(input);
  if (!result.ok) return result;

  try {
    const id = await insertBouquet(result.value);
    return { ok: true, id };
  } catch (err) {
    console.error(err);
    return { ok: false, error: "We couldn't save your bouquet. Please try again." };
  }
}
