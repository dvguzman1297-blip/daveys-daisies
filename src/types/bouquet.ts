export type FlowerId =
  | "daisy"
  | "sunflower"
  | "rose"
  | "tulip"
  | "babys-breath"
  | "lavender"
  | "chrysanthemum"
  | "marigold"
  | "dahlia"
  | "wheat";

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
  /** Seconds into the track where its best-known part starts; previews begin here. */
  chorusAt: number;
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

/** A trimmed slice of a YouTube video, played on a loop when the letter opens. */
export interface YouTubeClip {
  videoId: string;
  /** Looked up server-side from YouTube when the bouquet is saved. */
  title: string;
  author: string;
  /** Clip bounds in seconds. */
  start: number;
  end: number;
}

/** A recorded or chosen voice message, held in the browser until the bouquet is saved. */
export interface VoiceDraft {
  blob: Blob;
  /** Base audio type without codec parameters, e.g. "audio/webm". */
  mime: string;
  seconds: number;
  /** Object URL for previewing the audio in the builder. */
  previewUrl: string;
}

export interface LetterDraft {
  to: string;
  from: string;
  message: string;
  theme: LetterTheme;
  /** Optional background music played when the recipient opens the letter. */
  music: MusicTrackId | null;
  /** Alternative to `music`: a clip from a YouTube video. Only one is set at a time. */
  youtube: YouTubeClip | null;
  /** Optional: email the recipient a link to open the letter. */
  recipientEmail: string;
  /** Keep the sender's name off the email, the page header and link previews. */
  anonymous: boolean;
  /** Optional sign-off used instead of `from` when sending anonymously. */
  nickname: string;
  /** Optional recording the recipient can play after opening the letter. */
  voice: VoiceDraft | null;
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
  youtube: Pick<YouTubeClip, "videoId" | "start" | "end"> | null;
  recipientEmail: string | null;
  anonymous: boolean;
  /** Already uploaded to storage (see createVoiceUpload); `seconds` is the clip length. */
  voice: { path: string; seconds: number } | null;
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
  youtube: YouTubeClip | null;
  /** When true the sender's name is hidden from the page header, link previews and email. */
  anonymous: boolean;
  /** Storage path of the voice message; the recipient page turns it into a short-lived link. */
  voice_path: string | null;
  voice_seconds: number | null;
}

/** What happened when we tried to email the recipient. */
export type EmailOutcome =
  | { status: "sent"; to: string }
  | { status: "blocked" } // the recipient asked not to get our emails
  | { status: "limited" } // too many emails recently
  | { status: "failed" };

export type CreateBouquetResult =
  | { ok: true; id: string; email?: EmailOutcome }
  | { ok: false; error: string };
