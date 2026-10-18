import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { FlowerThumbnail } from "@/components/flowers/FlowerArt";
import { isUuid, verifyBouquetSig } from "@/lib/email/tokens";
import { blockEmail } from "../actions";

export const metadata: Metadata = {
  title: "Stop these emails",
  robots: { index: false, follow: false },
};

export default function BlockPage(props: PageProps<"/email/block/[id]">) {
  return (
    <Suspense fallback={null}>
      <BlockContent params={props.params} searchParams={props.searchParams} />
    </Suspense>
  );
}

async function BlockContent({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await params;
  const sigParam = (await searchParams).sig;
  const sig = typeof sigParam === "string" ? sigParam : "";
  // Only the real link from an email works; anything else looks like a missing page.
  if (!isUuid(id) || !verifyBouquetSig(id, sig)) notFound();

  return (
    <main className="paper-dots flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
      <FlowerThumbnail id="daisy" className="size-16" />
      <h1 className="mt-4 font-display text-3xl text-ink">Not for you?</h1>
      <p className="mt-2 max-w-md text-ink-soft">
        Someone entered your email address on Davey&apos;s Daisies to send you a bouquet. You can stop it here. We
        don&apos;t know who sent it if they chose to stay anonymous, and nothing is shown to them.
      </p>

      <form action={blockEmail} className="mt-8 flex w-full max-w-sm flex-col gap-3">
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="sig" value={sig} />
        <button
          type="submit"
          className="rounded-full bg-sage-700 px-6 py-3.5 font-bold text-white shadow-soft transition hover:bg-sage-700/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-500"
        >
          Stop emails to this address
        </button>
        <button
          type="submit"
          name="report"
          value="1"
          className="rounded-full border border-blush-300 bg-white/80 px-6 py-3.5 font-bold text-blush-700 transition hover:bg-blush-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blush-700"
        >
          Stop emails and report this letter
        </button>
      </form>
      <p className="mt-4 max-w-sm text-sm text-ink-soft">
        Reporting also hides the letter so no one can open it. Use it if the message was unkind or unwelcome.
      </p>
    </main>
  );
}
