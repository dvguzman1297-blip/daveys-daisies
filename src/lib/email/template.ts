import "server-only";

export interface BouquetEmailInput {
  recipientName: string;
  /** The sender's name, or null when sending anonymously. */
  senderName: string | null;
  openUrl: string;
  blockUrl: string;
}

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

/** Header values must be single-line. */
const oneLine = (s: string) => s.replace(/[\r\n]+/g, " ").trim();

/**
 * The email deliberately never contains the letter itself: it only announces a
 * bouquet and links to the page, so nothing private sits in an inbox, and an
 * anonymous sender can't be identified from it.
 */
export function renderBouquetEmail({ recipientName, senderName, openUrl, blockUrl }: BouquetEmailInput) {
  const who = senderName ? oneLine(senderName) : "Someone";
  const subject = `${who} sent you flowers`;
  const lead = senderName
    ? `${esc(who)} made you a bouquet and wrote you a letter.`
    : "Someone thought of you today and made you a bouquet, with a letter to go with it.";
  const leadText = senderName
    ? `${who} made you a bouquet and wrote you a letter.`
    : "Someone thought of you today and made you a bouquet, with a letter to go with it.";
  const note = senderName
    ? ""
    : `<p style="margin:16px 0 0;font-size:14px;line-height:1.5;color:#6b625a;">The sender chose to stay anonymous.</p>`;
  const noteText = senderName ? "" : "\nThe sender chose to stay anonymous.\n";
  const preheader = senderName ? `${who} sent you a bouquet and a letter.` : "A bouquet and a letter are waiting for you.";

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<title>${esc(subject)}</title>
</head>
<body style="margin:0;padding:0;background:#fbf7ee;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#fbf7ee;">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fbf7ee;">
<tr><td align="center" style="padding:32px 16px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
    <tr><td align="center" style="padding-bottom:20px;font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#3b3530;">Davey&#39;s Daisies</td></tr>
    <tr><td style="background:#ffffff;border:1px solid #e9efe4;border-radius:24px;padding:36px 32px;font-family:-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;color:#3b3530;">
      <p style="margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:28px;line-height:1.2;color:#3b3530;">Hi ${esc(recipientName)},</p>
      <p style="margin:0;font-size:17px;line-height:1.6;color:#3b3530;">${lead}</p>
      ${note}
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0 8px;">
        <tr><td style="background:#a84a5f;border-radius:999px;">
          <a href="${esc(openUrl)}" style="display:inline-block;padding:16px 32px;font-size:17px;font-weight:700;color:#ffffff;text-decoration:none;">Open your letter</a>
        </td></tr>
      </table>
      <p style="margin:16px 0 0;font-size:13px;line-height:1.5;color:#6b625a;">Button not working? Copy this link into your browser:<br><a href="${esc(openUrl)}" style="color:#a84a5f;word-break:break-all;">${esc(openUrl)}</a></p>
    </td></tr>
    <tr><td align="center" style="padding:20px 12px 0;font-family:-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;font-size:12px;line-height:1.6;color:#6b625a;">
      You got this because someone entered your email address on Davey&#39;s Daisies.<br>
      Not for you, or don&#39;t want these? <a href="${esc(blockUrl)}" style="color:#6b625a;text-decoration:underline;">Block or report</a>
    </td></tr>
  </table>
</td></tr>
</table>
</body>
</html>`;

  const text = `Hi ${recipientName},

${leadText}
${noteText}
Open your letter: ${openUrl}

---
You got this because someone entered your email address on Davey's Daisies.
Not for you, or don't want these? Block or report: ${blockUrl}
`;

  return { subject, html, text };
}
