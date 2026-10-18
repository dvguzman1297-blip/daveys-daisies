"use server";

import { redirect } from "next/navigation";
import { blockRecipientOf } from "@/lib/email/send";
import { getEmailInfo, markReported } from "@/lib/email/store";
import { isUuid, verifyBouquetSig } from "@/lib/email/tokens";

/**
 * Called from the Block/Report page. Checks the signed link first (Server Actions are
 * public endpoints), then stops all future emails to the address and, if asked,
 * hides the letter.
 */
export async function blockEmail(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const sig = formData.get("sig");
  const report = formData.get("report") === "1";
  if (!isUuid(id) || !verifyBouquetSig(id, sig)) redirect("/");

  const info = await getEmailInfo(id);
  if (info?.recipientEmail) await blockRecipientOf(info.recipientEmail);
  if (report) await markReported(id);
  redirect("/email/blocked");
}
