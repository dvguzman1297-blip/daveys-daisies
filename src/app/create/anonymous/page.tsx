import type { Metadata } from "next";
import { BouquetBuilder } from "@/components/BouquetBuilder";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Send Flowers Anonymously",
  description: "Send a bouquet and a letter without your name on it. They'll never know it was you, unless you tell them.",
};

/** The same builder, opened with "Anonymously" already chosen. */
export default function CreateAnonymousPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <BouquetBuilder initialAnonymous />
      </main>
    </>
  );
}
