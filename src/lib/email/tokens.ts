import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

/** The signing secret. Changing it invalidates old Report/Block links and forgets blocked addresses. */
function secret(): string {
  const s = process.env.EMAIL_LINK_SECRET;
  if (!s || s.length < 16) throw new Error("EMAIL_LINK_SECRET is not set (or too short).");
  return s;
}

const hmac = (purpose: string, value: string) => createHmac("sha256", secret()).update(`${purpose}:${value}`).digest("hex");

/** Signature that proves a Report/Block link was issued by us for this bouquet. */
export const signBouquetId = (bouquetId: string) => hmac("link", bouquetId);

export function verifyBouquetSig(bouquetId: string, sig: unknown): boolean {
  if (typeof sig !== "string" || !/^[0-9a-f]{64}$/.test(sig)) return false;
  const expected = Buffer.from(signBouquetId(bouquetId), "hex");
  const given = Buffer.from(sig, "hex");
  return expected.length === given.length && timingSafeEqual(expected, given);
}

/** Keyed hashes, so the block list and send log never hold raw addresses or IPs. */
export const hashEmail = (email: string) => hmac("email", email);
export const hashIp = (ip: string) => hmac("ip", ip);

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isUuid = (v: string) => UUID_RE.test(v);
