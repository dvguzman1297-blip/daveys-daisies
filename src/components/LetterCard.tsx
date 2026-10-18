import { getTheme } from "@/lib/catalog";
import type { LetterTheme } from "@/types/bouquet";

interface LetterCardProps {
  to: string;
  from: string;
  message: string;
  theme: LetterTheme;
  className?: string;
}

/** Read-only, themed letter. Used on the review step and the recipient page. */
export function LetterCard({ to, from, message, theme, className = "" }: LetterCardProps) {
  const t = getTheme(theme);
  const dark = theme === "midnight";
  return (
    <article className={`theme-${theme} relative rounded-3xl border p-6 shadow-soft sm:p-8 ${t.cardClass} ${className}`}>
      {dark && <Stars />}
      <p className={`text-xs font-bold uppercase tracking-widest ${dark ? "text-cream/60" : "text-ink-soft"}`}>
        A letter for
      </p>
      <h3 className="font-display text-2xl sm:text-3xl">{to}</h3>
      <p className="letter-lines mt-4 whitespace-pre-wrap break-words font-hand text-2xl">{message}</p>
      <p className="mt-6 text-right font-hand text-2xl">
        <span className={dark ? "text-cream/70" : "text-ink-soft"}>With love,</span>
        <br />
        {from}
      </p>
    </article>
  );
}

function Stars() {
  const stars = [
    [8, 12], [22, 6], [88, 10], [94, 30], [76, 4], [6, 60], [92, 72], [14, 90], [84, 92],
  ];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl" aria-hidden="true">
      {stars.map(([x, y], i) => (
        <span
          key={i}
          className="absolute size-1 rounded-full bg-butter-300/70"
          style={{ left: `${x}%`, top: `${y}%` }}
        />
      ))}
    </div>
  );
}
