import { ArrowRight, Flower2, Link2, PenLine } from "lucide-react";
import Link from "next/link";
import { BouquetCanvas } from "@/components/BouquetCanvas";
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
  { icon: PenLine, title: "Write a letter", body: "Say what's in your heart on a card of your choosing." },
  { icon: Link2, title: "Share the link", body: "Send it by message, social, or a scannable QR code." },
];

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div aria-hidden="true" className="pointer-events-none absolute -left-32 -top-24 size-96 rounded-full bg-blush-200/60 blur-3xl" />
          <div aria-hidden="true" className="pointer-events-none absolute -right-24 top-40 size-96 rounded-full bg-butter-300/40 blur-3xl" />
          <div aria-hidden="true" className="pointer-events-none absolute bottom-0 left-1/3 size-80 rounded-full bg-sage-200/60 blur-3xl" />

          <div className="relative mx-auto grid max-w-6xl items-center gap-8 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:py-20">
            <div className="text-center lg:text-left">
              <p className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-sm font-bold text-sage-700 shadow-soft">
                <Flower2 className="size-4" aria-hidden="true" /> Free · No sign-up needed
              </p>
              <h1 className="mt-5 font-display text-4xl leading-tight text-ink sm:text-5xl lg:text-6xl">
                Send Virtual Flowers &amp; Letters to Someone You Love
              </h1>
              <p className="mx-auto mt-5 max-w-lg text-lg text-ink-soft lg:mx-0">
                Hand-pick a bouquet of daisies, sunflowers and roses, tuck in a heartfelt note, and
                watch it bloom on their screen.
              </p>
              <Link
                href="/create"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-blush-500 px-8 py-4 text-lg font-bold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-blush-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blush-500"
              >
                Create Your Bouquet
                <ArrowRight className="size-5" aria-hidden="true" />
              </Link>
            </div>

            <BouquetCanvas
              flowers={SAMPLE}
              vase="ribbon"
              bloomDelay={0.2}
              className="mx-auto aspect-[4/5] w-full max-w-sm lg:max-w-md"
            />
          </div>
        </section>

        <section aria-labelledby="how-heading" className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
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
      </main>
      <footer className="border-t border-sage-100 py-6 text-center text-sm text-ink-soft">
        Made with love &amp; daisies.
      </footer>
    </>
  );
}
