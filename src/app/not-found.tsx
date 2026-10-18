import Link from "next/link";
import { FlowerThumbnail } from "@/components/flowers/FlowerArt";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-20 text-center">
      <FlowerThumbnail id="tulip" className="size-24 rotate-12 opacity-80" />
      <h1 className="mt-4 font-display text-3xl text-ink">This bouquet has wilted away</h1>
      <p className="mt-2 max-w-sm text-ink-soft">
        We couldn&apos;t find it. Double-check the link, or make a fresh bouquet of your own.
      </p>
      <Link
        href="/create"
        className="mt-6 rounded-full bg-sage-700 px-6 py-3 font-bold text-white transition hover:bg-sage-700/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-500"
      >
        Create Your Bouquet
      </Link>
    </main>
  );
}
