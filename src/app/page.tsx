import { ArrowRight, Check, Download, EyeOff, Flower2, Link2, Music, PenLine, QrCode } from "lucide-react";
import Link from "next/link";
import { HeroScene } from "@/components/HeroScene";
import { SiteHeader } from "@/components/SiteHeader";
import type { BouquetFlower } from "@/types/bouquet";

const SAMPLE: BouquetFlower[] = [
  { id: "daisy", name: "Daisy", count: 3 },
  { id: "sunflower", name: "Sunflower", count: 1 },
  { id: "rose", name: "Rose", count: 2 },
  { id: "tulip", name: "Tulip", count: 1 },
  { id: "lavender", name: "Lavender", count: 1 },
  { id: "babys-breath", name: "Baby's Breath", count: 1 },
];

const HOW = [
  { icon: Flower2, title: "Arrange a bouquet", body: "Start from a ready-made bouquet or pick up to 20 blooms and a wrap they'll love." },
  { icon: PenLine, title: "Write a letter", body: "Say what's in your heart, as long as you like, on a card of your choosing." },
  { icon: Link2, title: "Share the link", body: "Send it by message, social, or a scannable QR code." },
];

const EXTRAS = [
  { icon: Music, title: "Add a song", body: "Pick from our list, or paste a YouTube link and choose exactly which part plays." },
  { icon: Download, title: "A keepsake to save", body: "They can download the bouquet and letter together as a picture to keep." },
  { icon: QrCode, title: "Share it your way", body: "A private link and a QR code, ready for a card, a text or a story." },
  { icon: EyeOff, title: "Send it anonymously", body: "Email it to them and keep your name off the email, the page and the link preview." },
];

export default function Home() {
  return (
    <>
      <div className="relative">
        {/* Soft colour washes behind the header and hero; masked so they fade out instead of ending in a hard edge. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden [mask-image:linear-gradient(to_bottom,#000_55%,transparent)]"
        >
          <div className="absolute -left-32 -top-24 size-96 rounded-full bg-blush-200/60 blur-3xl" />
          <div className="absolute -right-24 top-40 size-96 rounded-full bg-butter-300/40 blur-3xl" />
          <div className="absolute bottom-10 left-1/3 size-80 rounded-full bg-sage-200/60 blur-3xl" />
        </div>

        <SiteHeader cta />

        <main className="relative">
          <section className="mx-auto grid max-w-6xl items-center gap-8 px-4 pb-10 pt-6 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:pb-24 lg:pt-12">
            <div className="text-center lg:text-left">
              <h1 className="text-balance font-display text-4xl leading-tight text-ink sm:text-5xl lg:text-6xl">
                Send flowers that bloom on their screen
              </h1>
              <p className="mx-auto mt-5 max-w-lg text-lg text-ink-soft lg:mx-0">
                Hand-pick a bouquet of daisies, sunflowers and roses, tuck in a heartfelt letter, and send it as a link
                they can open anywhere.
              </p>

              <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center lg:justify-start">
                <Link
                  href="/create"
                  className="inline-flex items-center gap-2 rounded-full bg-blush-700 px-8 py-4 text-lg font-bold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-blush-700/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blush-700"
                >
                  Create Your Bouquet
                  <ArrowRight className="size-5" aria-hidden="true" />
                </Link>
                <Link
                  href="/create/anonymous"
                  className="inline-flex items-center gap-2 rounded-full border border-sage-300 bg-white/70 px-6 py-4 text-lg font-bold text-sage-700 transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-500"
                >
                  <EyeOff className="size-5" aria-hidden="true" />
                  Send anonymously
                </Link>
              </div>

              <ul className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-1 text-sm font-semibold text-sage-700 lg:justify-start">
                {["Free", "No sign-up needed", "Private link"].map((t) => (
                  <li key={t} className="inline-flex items-center gap-1.5">
                    <Check className="size-4" aria-hidden="true" />
                    {t}
                  </li>
                ))}
              </ul>
              <p className="mt-4">
                <Link
                  href="/example"
                  className="inline-flex items-center gap-1 font-bold text-sage-700 underline underline-offset-4 hover:text-sage-700/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-500"
                >
                  See an example
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </p>

            </div>

            <HeroScene flowers={SAMPLE} vase="ribbon" />
          </section>

          <section aria-labelledby="how-heading" className="mx-auto max-w-6xl px-4 pb-16 pt-4 sm:px-6">
            <h2 id="how-heading" className="text-center font-display text-3xl text-ink">
              How it works
            </h2>
            <ol className="mt-8 grid gap-4 sm:grid-cols-3">
              {HOW.map(({ icon: Icon, title, body }, i) => (
                <li key={title} className="rounded-3xl border border-sage-100 bg-white/70 p-6 shadow-soft">
                  <span className="grid size-11 place-items-center rounded-full bg-sage-100 text-sage-700">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 font-display text-xl text-ink">
                    {i + 1}. {title}
                  </h3>
                  <p className="mt-1 text-ink-soft">{body}</p>
                </li>
              ))}
            </ol>
          </section>

          <section aria-labelledby="extras-heading" className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
            <h2 id="extras-heading" className="text-center font-display text-3xl text-ink">
              Little extras that make it personal
            </h2>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {EXTRAS.map(({ icon: Icon, title, body }) => (
                <li key={title} className="rounded-3xl border border-blush-200 bg-blush-100/60 p-6">
                  <span className="grid size-11 place-items-center rounded-full bg-white text-blush-700">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 font-display text-xl text-ink">{title}</h3>
                  <p className="mt-1 text-ink-soft">{body}</p>
                </li>
              ))}
            </ul>
            <div className="mt-10 text-center">
              <Link
                href="/create"
                className="inline-flex items-center gap-2 rounded-full bg-blush-700 px-8 py-4 text-lg font-bold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-blush-700/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blush-700"
              >
                Start your bouquet
                <ArrowRight className="size-5" aria-hidden="true" />
              </Link>
            </div>
          </section>
        </main>
      </div>

      <footer className="border-t border-sage-100 px-4 py-8 text-center text-sm text-ink-soft">
        <nav aria-label="Footer" className="mb-3 flex justify-center gap-6 font-semibold text-sage-700">
          <Link href="/create" className="hover:underline focus-visible:outline-2 focus-visible:outline-sage-500">
            Create a bouquet
          </Link>
          <Link href="/create/anonymous" className="hover:underline focus-visible:outline-2 focus-visible:outline-sage-500">
            Send anonymously
          </Link>
          <Link href="/example" className="hover:underline focus-visible:outline-2 focus-visible:outline-sage-500">
            See an example
          </Link>
        </nav>
        <p>Letters are only visible to people who have the link.</p>
        <p className="mt-1">Made with love &amp; daisies.</p>
      </footer>
    </>
  );
}
