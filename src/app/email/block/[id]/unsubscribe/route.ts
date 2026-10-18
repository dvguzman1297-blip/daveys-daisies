import { blockRecipientOf } from "@/lib/email/send";
import { getEmailInfo } from "@/lib/email/store";
import { isUuid, verifyBouquetSig } from "@/lib/email/tokens";

/**
 * One-click unsubscribe (RFC 8058): mail apps like Gmail POST here when someone taps
 * "Unsubscribe" next to the sender. It is POST-only on purpose: link scanners
 * open links with GET, and they must not be able to block an address by accident.
 */
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const sig = new URL(request.url).searchParams.get("sig");
  if (!isUuid(id) || !verifyBouquetSig(id, sig)) return new Response("Invalid link", { status: 400 });

  const info = await getEmailInfo(id);
  if (info?.recipientEmail) await blockRecipientOf(info.recipientEmail);
  return new Response("You won't get more emails from Davey's Daisies at this address.", { status: 200 });
}
