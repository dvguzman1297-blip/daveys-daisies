"use client";

import confetti from "canvas-confetti";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, ExternalLink, MessageCircle, Send, Share2, X } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useRef, useState } from "react";
import type { EmailOutcome } from "@/types/bouquet";

interface ShareModalProps {
  open: boolean;
  url: string;
  recipientName: string;
  /** What happened when we tried to email the recipient, if the sender asked us to. */
  email?: EmailOutcome | null;
  onClose: () => void;
}

const PETAL_COLORS = ["#f3bfc8", "#fbe49e", "#b9cbb0", "#ffffff", "#e48a9b"];

export function ShareModal({ open, url, recipientName, email, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  // The modal only renders after a client interaction, so reading navigator here is hydration-safe.
  const canNativeShare = typeof navigator !== "undefined" && "share" in navigator;

  const text = `I made a bouquet for you, ${recipientName} 💐`;
  const enc = encodeURIComponent;
  const fbAppId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
  const links = [
    {
      label: "WhatsApp",
      href: `https://wa.me/?text=${enc(`${text} ${url}`)}`,
      icon: MessageCircle,
      className: "bg-[#25D366]/15 text-[#128C4B] hover:bg-[#25D366]/25",
    },
    {
      label: "X / Twitter",
      href: `https://twitter.com/intent/tweet?text=${enc(text)}&url=${enc(url)}`,
      icon: XLogo,
      className: "bg-ink/10 text-ink hover:bg-ink/15",
    },
    {
      label: "Messenger",
      // The web Send dialog requires a Facebook App ID; otherwise fall back to the mobile app scheme.
      href: fbAppId
        ? `https://www.facebook.com/dialog/send?app_id=${fbAppId}&link=${enc(url)}&redirect_uri=${enc(url)}`
        : `fb-messenger://share/?link=${enc(url)}`,
      icon: Send,
      className: "bg-[#0084FF]/15 text-[#0062C2] hover:bg-[#0084FF]/25",
    },
  ];

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();

    const burst = (originX: number) =>
      confetti({
        particleCount: 70,
        spread: 70,
        startVelocity: 38,
        origin: { x: originX, y: 0.7 },
        colors: PETAL_COLORS,
        shapes: ["circle"],
        scalar: 1.1,
        disableForReducedMotion: true,
      });
    burst(0.25);
    const t = setTimeout(() => burst(0.75), 180);

    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Clipboard API unavailable (e.g. insecure context) — fall back to a selection copy.
      const input = document.getElementById("share-url") as HTMLInputElement | null;
      input?.select();
      document.execCommand?.("copy");
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-end bg-ink/40 backdrop-blur-sm sm:place-items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-title"
            className="relative max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl bg-cream p-6 shadow-2xl sm:max-w-md sm:rounded-3xl"
            initial={{ y: 60, scale: 0.96, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-4 top-4 grid size-9 place-items-center rounded-full text-ink-soft transition hover:bg-sage-100 focus-visible:outline-2 focus-visible:outline-sage-500"
            >
              <X className="size-5" aria-hidden="true" />
            </button>

            <h2 id="share-title" className="pr-10 font-display text-2xl text-ink">
              Your bouquet is ready!
            </h2>
            <p className="mt-1 text-sm text-ink-soft">
              Send this link to {recipientName}. Anyone with the link can open it.
            </p>
            {email && (
              <p
                role="status"
                className={`mt-3 rounded-xl px-3 py-2 text-sm font-semibold ${
                  email.status === "sent" ? "bg-sage-100 text-sage-700" : "bg-blush-100 text-blush-700"
                }`}
              >
                {email.status === "sent" && `We emailed ${email.to} with a link to open it.`}
                {email.status === "blocked" &&
                  "That address has asked not to get emails from us, so we didn't send one. You can still share the link yourself."}
                {email.status === "limited" &&
                  "We've sent a lot of emails recently, so we didn't send this one. You can still share the link yourself."}
                {email.status === "failed" && "We couldn't send the email, but your link is ready to share yourself."}
              </p>
            )}

            <div className="mt-5 flex gap-2">
              <label htmlFor="share-url" className="sr-only">
                Shareable link
              </label>
              <input
                id="share-url"
                readOnly
                value={url}
                onFocus={(e) => e.currentTarget.select()}
                className="min-w-0 flex-1 rounded-xl border border-sage-200 bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-sage-500"
              />
              <button
                type="button"
                onClick={copy}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-sage-700 px-4 text-sm font-bold text-white transition hover:bg-sage-700/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-500"
              >
                {copied ? <Check className="size-4" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
                <span aria-live="polite">{copied ? "Copied!" : "Copy"}</span>
              </button>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              {links.map(({ label, href, icon: Icon, className }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex flex-col items-center gap-1 rounded-xl px-2 py-3 text-xs font-bold transition focus-visible:outline-2 focus-visible:outline-sage-500 ${className}`}
                >
                  <Icon className="size-5" aria-hidden="true" />
                  {label}
                </a>
              ))}
            </div>

            {canNativeShare && (
              <button
                type="button"
                onClick={() => navigator.share({ title: "A bouquet for you", text, url }).catch(() => {})}
                className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-sage-200 bg-white py-2.5 text-sm font-bold text-sage-700 transition hover:bg-sage-100 focus-visible:outline-2 focus-visible:outline-sage-500"
              >
                <Share2 className="size-4" aria-hidden="true" />
                More sharing options
              </button>
            )}

            <div className="mt-6 flex items-center gap-4 rounded-2xl bg-white p-4">
              <QRCodeSVG
                value={url}
                size={112}
                bgColor="#ffffff"
                fgColor="#3b3530"
                level="M"
                marginSize={0}
                title="QR code for your bouquet link"
                className="shrink-0"
              />
              <div className="text-sm text-ink-soft">
                <p className="font-bold text-ink">Scan to open on mobile</p>
                <p className="mt-1">Point a phone camera at the code to view the bouquet.</p>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1 font-bold text-blush-700 underline-offset-2 hover:underline"
                >
                  Preview <ExternalLink className="size-3.5" aria-hidden="true" />
                </a>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function XLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
    </svg>
  );
}
