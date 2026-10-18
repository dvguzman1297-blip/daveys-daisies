import { Skeleton } from "@/components/Skeleton";

/** Mirrors the closed-envelope view of a received bouquet while its data loads. */
export default function Loading() {
  return (
    <main
      className="paper-dots flex flex-1 flex-col items-center justify-center px-4 pb-16 pt-10 sm:px-6"
      aria-busy="true"
    >
      <div className="flex w-full max-w-md flex-col items-center gap-3">
        <Skeleton className="h-4 w-44 rounded-full" />
        <Skeleton className="h-11 w-64 sm:h-14 sm:w-80" />
        <Skeleton className="h-4 w-52 rounded-full" />
      </div>
      <Skeleton className="mt-6 aspect-[3/2] w-full max-w-md rounded-2xl" />
      <p role="status" className="mt-5 font-display text-lg text-ink-soft">
        Gathering your flowers…
      </p>
    </main>
  );
}
