/** Email address helpers shared by the browser (inline validation) and the server (real validation). */

const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:"]{2,}$/;

/** Trims, lowercases and checks an address. Returns null when it isn't a plausible email. */
export function normalizeEmail(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const email = input.trim().toLowerCase();
  if (email.length < 3 || email.length > 254) return null;
  return EMAIL_RE.test(email) ? email : null;
}

/** "jane.doe@gmail.com" -> "j***@gmail.com", for showing back to the sender. */
export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  return `${local.slice(0, 1)}***@${domain}`;
}
