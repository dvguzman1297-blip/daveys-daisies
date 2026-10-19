import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RecipientView } from "@/components/RecipientView";
import { getBouquet } from "@/lib/bouquets";
import { signVoiceUrls } from "@/lib/voice-storage";

export async function generateMetadata(props: PageProps<"/b/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  const bouquet = await getBouquet(id);
  if (!bouquet) return { title: "Bouquet not found" };

  const title = `A bouquet for ${bouquet.recipient_name}`;
  // Link previews are public, so an anonymous sender's name must not appear in them.
  const description = `${bouquet.anonymous ? "Someone" : bouquet.sender_name} sent you flowers and a letter. Tap to open.`;
  return {
    title,
    description,
    // Private letters: keep them out of search results.
    robots: { index: false, follow: false },
    openGraph: { title, description },
  };
}

export default async function BouquetPage(props: PageProps<"/b/[id]">) {
  const { id } = await props.params;
  const bouquet = await getBouquet(id);
  if (!bouquet) notFound();

  const voice = bouquet.voice_path ? await signVoiceUrls(bouquet.voice_path) : null;

  return <RecipientView bouquet={bouquet} voice={voice} />;
}
