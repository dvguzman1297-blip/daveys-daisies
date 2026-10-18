import "server-only";
import { headers } from "next/headers";
import { Resend } from "resend";
import type { EmailOutcome } from "@/types/bouquet";
import { maskEmail } from "./address";
import { addBlock, countRecentSends, isBlocked, logSend, markEmailSent } from "./store";
import { renderBouquetEmail } from "./template";
import { hashEmail, hashIp, signBouquetId } from "./tokens";

/** Limits that keep anonymous email from being used to spam or harass someone. */
const PRODUCTION_LIMITS = {
  perIpPerHour: 5,
  perIpPerDay: 20,
  perRecipientPerDay: 3,
};
/** Much higher while developing, so repeated tests to the same address aren't blocked. */
const DEVELOPMENT_LIMITS = {
  perIpPerHour: 200,
  perIpPerDay: 1000,
  perRecipientPerDay: 200,
};
// `next dev` runs with NODE_ENV=development; every deployment (including Vercel previews) runs as production.
const LIMITS = process.env.NODE_ENV === "development" ? DEVELOPMENT_LIMITS : PRODUCTION_LIMITS;
const HOUR = 60 * 60 * 1000;

const siteUrl = () => (process.env.SITE_URL ?? "").replace(/\/+$/, "");
const isConfigured = () => !!process.env.RESEND_API_KEY && !!process.env.EMAIL_FROM && !!process.env.EMAIL_LINK_SECRET && !!siteUrl();

/** The visitor's IP, from the proxy headers Vercel sets. Only ever stored as a keyed hash. */
async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

export const blockLink = (bouquetId: string) => `${siteUrl()}/email/block/${bouquetId}?sig=${signBouquetId(bouquetId)}`;

interface SendInput {
  bouquetId: string;
  to: string;
  recipientName: string;
  /** The sender's name, or null to keep it off the email entirely. */
  senderName: string | null;
}

/**
 * Emails the recipient a link to the bouquet. Never throws: the bouquet is
 * already saved, so any problem is reported back as an outcome and the sender
 * can still share the link themselves.
 */
export async function sendBouquetEmail({ bouquetId, to, recipientName, senderName }: SendInput): Promise<EmailOutcome> {
  try {
    if (!isConfigured()) {
      console.warn("[email] Not configured (RESEND_API_KEY, EMAIL_FROM, EMAIL_LINK_SECRET, SITE_URL): skipping send.");
      return { status: "failed" };
    }

    const recipientHash = hashEmail(to);
    if (await isBlocked(recipientHash)) return { status: "blocked" };

    const ipHash = hashIp(await clientIp());
    const now = Date.now();
    const [lastHour, lastDay] = await Promise.all([
      countRecentSends(ipHash, recipientHash, new Date(now - HOUR)),
      countRecentSends(ipHash, recipientHash, new Date(now - 24 * HOUR)),
    ]);
    if (
      lastHour.byIp >= LIMITS.perIpPerHour ||
      lastDay.byIp >= LIMITS.perIpPerDay ||
      lastDay.byRecipient >= LIMITS.perRecipientPerDay
    ) {
      return { status: "limited" };
    }

    // Log before sending so failed attempts still count towards the limits.
    await logSend(bouquetId, ipHash, recipientHash);

    const { subject, html, text } = renderBouquetEmail({
      recipientName,
      senderName,
      openUrl: `${siteUrl()}/b/${bouquetId}`,
      blockUrl: blockLink(bouquetId),
    });
    const oneClick = `${siteUrl()}/email/block/${bouquetId}/unsubscribe?sig=${signBouquetId(bouquetId)}`;

    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send(
      {
        from: process.env.EMAIL_FROM!,
        to,
        subject,
        html,
        text,
        headers: {
          "List-Unsubscribe": `<${oneClick}>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
      },
      // A double click or retry can't send the same bouquet twice.
      { idempotencyKey: `bouquet-${bouquetId}` },
    );
    if (error) {
      console.error("[email] Resend rejected the email:", error.name, error.message);
      return { status: "failed" };
    }

    await markEmailSent(bouquetId);
    return { status: "sent", to: maskEmail(to) };
  } catch (err) {
    console.error("[email] Sending failed:", err);
    return { status: "failed" };
  }
}

/** Stops all future emails to the address on a bouquet. Used by the Block/Report page and one-click unsubscribe. */
export async function blockRecipientOf(email: string): Promise<void> {
  await addBlock(hashEmail(email));
}
