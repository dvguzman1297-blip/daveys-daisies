import Link from "next/link";
import { FlowerThumbnail } from "./flowers/FlowerArt";

export function SiteHeader({ cta = false }: { cta?: boolean }) {
  return (
    <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-full font-display text-lg text-ink focus-visible:outline-2 focus-visible:outline-sage-500 sm:text-xl"
      >
        {/* The daisy is white, so it needs a tinted badge to show against the cream page. */}
        <span className="grid size-10 place-items-center rounded-full bg-sage-300/70">
          <FlowerThumbnail id="daisy" className="size-8" />
        </span>
        Davey&apos;s Daisies
      </Link>
      {cta && (
        <Link
          href="/create"
          className="shrink-0 whitespace-nowrap rounded-full bg-blush-700 px-3.5 py-2 text-sm font-bold sm:px-4 text-white shadow-soft transition hover:bg-blush-700/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blush-700"
        >
          Create a bouquet
        </Link>
      )}
    </header>
  );
}
