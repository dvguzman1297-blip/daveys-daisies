export type FlowerId =
  | "daisy"
  | "sunflower"
  | "rose"
  | "tulip"
  | "babys-breath"
  | "lavender";

export type VaseStyle = "glass" | "ribbon" | "kraft" | "newspaper" | "tissue" | "mason" | "pitcher" | "basket";

export type LetterTheme = "parchment" | "blush" | "midnight";

export type MusicTrackId =
  | "clair-de-lune"
  | "liebestraum"
  | "canon-in-d"
  | "gymnopedie"
  | "love-song"
  | "fairytale-waltz";

/** A background music track. All are public domain or CC BY (credited in the player). */
export interface MusicTrack {
  id: MusicTrackId;
  title: string;
  /** Composer and recording, shown under the title. */
  subtitle: string;
  mood: string;
  src: string;
  /** Required credit line (CC BY) or a courtesy credit (public domain). */
  credit: string;
  license: "Public domain" | "CC BY 3.0";
  licenseUrl?: string;
  sourceUrl: string;
}

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
  /** Optional background music played when the recipient opens the letter. */
  music: MusicTrackId | null;
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
  music: MusicTrackId | null;
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
  music: MusicTrackId | null;
}

export type CreateBouquetResult =
  | { ok: true; id: string }
  | { ok: false; error: string };
