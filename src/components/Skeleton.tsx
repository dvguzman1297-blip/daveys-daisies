/**
 * A softly pulsing placeholder block. Size and shape come from `className`,
 * so a skeleton can mimic the layout of whatever it stands in for.
 * Decorative, and the pulse stops for people who prefer reduced motion.
 */
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-xl bg-sage-200/60 motion-reduce:animate-none ${className}`}
    />
  );
}
