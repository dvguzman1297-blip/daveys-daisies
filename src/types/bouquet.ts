export type FlowerId =
  | "daisy"
  | "sunflower"
  | "rose"
  | "tulip"
  | "babys-breath"
  | "lavender";

export type VaseStyle = "glass" | "ribbon" | "kraft" | "newspaper" | "tissue" | "mason" | "pitcher" | "basket";

export type LetterTheme = "parchment" | "blush" | "midnight";

/** One entry in a bouquet — matches the shape stored in `bouquets.flowers`. */
export interface BouquetFlower {
  id: FlowerId;
  name: string;
  count: number;
}

/** Catalog definition for a selectable flower. */
export interface FlowerDefinition {
  id: FlowerId;
  name: string;
  meaning: string;
}

/** A ready-made arrangement users can start from (and then tweak). */
export interface BouquetPreset {
  id: string;
  name: string;
  description: string;
  vase: VaseStyle;
  flowers: Pick<BouquetFlower, "id" | "count">[];
}

export interface VaseDefinition {
  id: VaseStyle;
  name: string;
}

export interface ThemeDefinition {
  id: LetterTheme;
  name: string;
  /** Tailwind classes for the letter card surface. */
  cardClass: string;
  /** Tailwind classes for the swatch shown in the theme picker. */
  swatchClass: string;
}

export interface LetterDraft {
  to: string;
  from: string;
  message: string;
  theme: LetterTheme;
}

/** Client-side builder state. */
export interface BuilderState {
  flowers: BouquetFlower[];
  vase: VaseStyle;
  letter: LetterDraft;
}

/** Payload sent from the builder to the server action. */
export interface CreateBouquetInput {
  senderName: string;
  recipientName: string;
  message: string;
  theme: LetterTheme;
  vaseStyle: VaseStyle;
  flowers: Pick<BouquetFlower, "id" | "count">[];
}

/** Row in the Supabase `bouquets` table. */
export interface BouquetRecord {
  id: string;
  created_at: string;
  sender_name: string;
  recipient_name: string;
  message: string;
  theme: LetterTheme;
  flowers: BouquetFlower[];
  vase_style: VaseStyle;
}

export type CreateBouquetResult =
  | { ok: true; id: string }
  | { ok: false; error: string };
