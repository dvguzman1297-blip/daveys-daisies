import type { Metadata } from "next";
import Link from "next/link";
import { FlowerThumbnail } from "@/components/flowers/FlowerArt";

export const metadata: Metadata = {
  title: "All set",
  robots: { index: false, follow: false },
};

export default function BlockedPage() {
  return (
    <main className="paper-dots flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
      <FlowerThumbnail id="tulip" className="size-20 rotate-6" />
      <h1 className="mt-4 font-display text-3xl text-ink">You&apos;re all set</h1>
      <p className="mt-2 max-w-md text-ink-soft">
        We won&apos;t email this address again. If you reported a letter, it has been hidden. Sorry for the bother.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-full bg-sage-700 px-6 py-3 font-bold text-white transition hover:bg-sage-700/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-500"
      >
        Back to Davey&apos;s Daisies
      </Link>
    </main>
  );
}
