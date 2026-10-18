import type { Metadata } from "next";
import { BouquetBuilder } from "@/components/BouquetBuilder";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Create Your Bouquet",
};

export default function CreatePage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <BouquetBuilder />
      </main>
    </>
  );
}
