import { SiteHeader } from "@/components/SiteHeader";
import { Skeleton } from "@/components/Skeleton";

/** Mirrors the builder's first step (preview on the left, pickers on the right) while it loads. */
export default function Loading() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1" aria-busy="true">
        <p role="status" className="sr-only">
          Loading the bouquet builder…
        </p>
        <div className="mx-auto w-full max-w-6xl px-4 pb-32 pt-6 sm:px-6 lg:pb-12">
          {/* Step indicator */}
          <div className="flex justify-center gap-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-10 w-24 rounded-full sm:w-32" />
            ))}
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-10">
            {/* Bouquet preview */}
            <div className="rounded-[2rem] border border-sage-100 bg-white/60 p-4 shadow-soft">
              <Skeleton className="mx-auto aspect-[4/5] w-full max-w-md rounded-3xl" />
            </div>

            <div className="flex min-w-0 flex-col gap-8">
              {/* Ready-made bouquets */}
              <div>
                <Skeleton className="h-7 w-48" />
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {[0, 1, 2].map((i) => (
                    <Skeleton key={i} className="h-28 rounded-2xl" />
                  ))}
                </div>
              </div>
              {/* Flowers */}
              <div>
                <Skeleton className="h-7 w-40" />
                <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-6">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-24 rounded-2xl" />
                  ))}
                </div>
              </div>
              {/* Wraps and vases */}
              <div>
                <Skeleton className="h-7 w-32" />
                <div className="mt-3 grid grid-cols-3 gap-3">
                  {[0, 1, 2].map((i) => (
                    <Skeleton key={i} className="h-24 rounded-2xl" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
