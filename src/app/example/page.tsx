import type { Metadata } from "next";
import { RecipientView } from "@/components/RecipientView";
import type { BouquetRecord } from "@/types/bouquet";

export const metadata: Metadata = {
  title: "An example bouquet",
  description: "See what someone receives when you send them a bouquet and a letter.",
};

/** A made-up bouquet so visitors can try the opening experience without creating anything. */
const EXAMPLE: BouquetRecord = {
  id: "example",
  created_at: "2026-01-01T00:00:00.000Z",
  sender_name: "Dave",
  recipient_name: "you",
  message:
    "I picked these out thinking of you. Every one of them is a small way of saying thank you for being such a bright part of my days.\n\nThis is what your own bouquet could look like. Make one for someone you love.",
  theme: "parchment",
  vase_style: "ribbon",
  flowers: [
    { id: "daisy", name: "Daisy", count: 3 },
    { id: "sunflower", name: "Sunflower", count: 2 },
    { id: "rose", name: "Rose", count: 3 },
    { id: "tulip", name: "Tulip", count: 1 },
    { id: "lavender", name: "Lavender", count: 2 },
    { id: "babys-breath", name: "Baby's Breath", count: 1 },
  ],
  music: "clair-de-lune",
  youtube: null,
  anonymous: false,
  voice_path: null,
  voice_seconds: null,
};

export default function ExamplePage() {
  return <RecipientView bouquet={EXAMPLE} />;
}
