import Link from "next/link";
import { FlowerThumbnail } from "./flowers/FlowerArt";

export function SiteHeader() {
  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-full font-display text-xl text-ink focus-visible:outline-2 focus-visible:outline-sage-500"
      >
        <FlowerThumbnail id="daisy" className="size-8" />
        Davey&apos;s Daisies
      </Link>
    </header>
  );
}
