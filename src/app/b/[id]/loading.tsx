import { FlowerThumbnail } from "@/components/flowers/FlowerArt";

export default function Loading() {
  return (
    <main className="paper-dots flex flex-1 flex-col items-center justify-center gap-3 px-4 py-20" aria-busy="true">
      <FlowerThumbnail id="daisy" className="size-16 animate-spin [animation-duration:3s] motion-reduce:animate-none" />
      <p className="font-display text-lg text-ink-soft">Gathering your flowers…</p>
    </main>
  );
}
