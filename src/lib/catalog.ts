import type {
  BouquetPreset,
  FlowerDefinition,
  FlowerId,
  LetterTheme,
  MusicTrack,
  MusicTrackId,
  ThemeDefinition,
  VaseDefinition,
  VaseStyle,
} from "@/types/bouquet";

export const MAX_FLOWERS = 20;
export const MAX_MESSAGE_LENGTH = 5000;
export const MAX_NAME_LENGTH = 40;
/** How an anonymous letter is signed when the sender doesn't pick a nickname. */
export const ANONYMOUS_SIGNATURE = "A secret admirer";

export const FLOWERS: FlowerDefinition[] = [
  { id: "daisy", name: "Daisy", meaning: "Innocence & joy" },
  { id: "sunflower", name: "Sunflower", meaning: "Warmth & loyalty" },
  { id: "rose", name: "Rose", meaning: "Love & admiration" },
  { id: "tulip", name: "Tulip", meaning: "Perfect love" },
  { id: "babys-breath", name: "Baby's Breath", meaning: "Everlasting love" },
  { id: "lavender", name: "Lavender", meaning: "Devotion & calm" },
  { id: "chrysanthemum", name: "Chrysanthemum", meaning: "Joy & long life" },
  { id: "marigold", name: "Marigold", meaning: "Warmth & remembrance" },
  { id: "dahlia", name: "Dahlia", meaning: "Elegance & commitment" },
  { id: "wheat", name: "Wheat", meaning: "Prosperity & gratitude" },
];

export const PRESETS: BouquetPreset[] = [
  {
    id: "autumn-harvest",
    name: "Autumn Harvest",
    description: "Sunflowers, marigolds and golden wheat in a woven basket",
    vase: "basket",
    flowers: [
      { id: "sunflower", count: 3 },
      { id: "marigold", count: 4 },
      { id: "chrysanthemum", count: 3 },
      { id: "wheat", count: 3 },
    ],
  },
  {
    id: "maple-glow",
    name: "Maple Glow",
    description: "Burgundy dahlias and rust mums wrapped in kraft paper",
    vase: "kraft",
    flowers: [
      { id: "dahlia", count: 4 },
      { id: "chrysanthemum", count: 4 },
      { id: "rose", count: 2 },
      { id: "wheat", count: 2 },
    ],
  },
  {
    id: "pumpkin-patch",
    name: "Pumpkin Patch",
    description: "Orange marigolds and mums in a twine-tied mason jar",
    vase: "mason",
    flowers: [
      { id: "marigold", count: 5 },
      { id: "chrysanthemum", count: 3 },
      { id: "wheat", count: 2 },
    ],
  },
  {
    id: "classic-romance",
    name: "Classic Romance",
    description: "Red roses with a cloud of baby's breath",
    vase: "ribbon",
    flowers: [
      { id: "rose", count: 7 },
      { id: "babys-breath", count: 3 },
    ],
  },
  {
    id: "sunny-side-up",
    name: "Sunny Side Up",
    description: "Sunflowers and daisies to brighten a day",
    vase: "kraft",
    flowers: [
      { id: "sunflower", count: 3 },
      { id: "daisy", count: 5 },
      { id: "babys-breath", count: 2 },
    ],
  },
  {
    id: "daisy-chain",
    name: "Daisy Chain",
    description: "A simple, cheerful jar of daisies",
    vase: "glass",
    flowers: [
      { id: "daisy", count: 9 },
      { id: "babys-breath", count: 2 },
    ],
  },
  {
    id: "lavender-fields",
    name: "Lavender Fields",
    description: "Calming lavender with soft white accents",
    vase: "kraft",
    flowers: [
      { id: "lavender", count: 7 },
      { id: "daisy", count: 3 },
      { id: "babys-breath", count: 2 },
    ],
  },
  {
    id: "spring-garden",
    name: "Spring Garden",
    description: "Tulips, daisies and lavender, fresh from the garden",
    vase: "ribbon",
    flowers: [
      { id: "tulip", count: 5 },
      { id: "daisy", count: 4 },
      { id: "lavender", count: 3 },
      { id: "babys-breath", count: 2 },
    ],
  },
  {
    id: "grand-gesture",
    name: "The Grand Gesture",
    description: "A little of everything, filled to the brim",
    vase: "ribbon",
    flowers: [
      { id: "rose", count: 5 },
      { id: "tulip", count: 4 },
      { id: "sunflower", count: 3 },
      { id: "daisy", count: 3 },
      { id: "lavender", count: 3 },
      { id: "babys-breath", count: 2 },
    ],
  },
  {
    id: "market-morning",
    name: "Market Morning",
    description: "Fresh from the flower stall, wrapped in newsprint",
    vase: "newspaper",
    flowers: [
      { id: "sunflower", count: 3 },
      { id: "tulip", count: 3 },
      { id: "daisy", count: 3 },
      { id: "babys-breath", count: 2 },
    ],
  },
  {
    id: "farmhouse-jar",
    name: "Farmhouse Jar",
    description: "Daisies and lavender in a twine-tied mason jar",
    vase: "mason",
    flowers: [
      { id: "daisy", count: 5 },
      { id: "lavender", count: 3 },
      { id: "babys-breath", count: 3 },
    ],
  },
  {
    id: "lilac-love",
    name: "Lilac Love",
    description: "Lavender and pink tulips in soft lilac tissue",
    vase: "tissue",
    flowers: [
      { id: "lavender", count: 5 },
      { id: "tulip", count: 4 },
      { id: "babys-breath", count: 3 },
    ],
  },
  {
    id: "cottage-pitcher",
    name: "Cottage Pitcher",
    description: "A cottage-garden mix in a painted pitcher",
    vase: "pitcher",
    flowers: [
      { id: "rose", count: 3 },
      { id: "daisy", count: 4 },
      { id: "tulip", count: 3 },
      { id: "babys-breath", count: 2 },
    ],
  },
  {
    id: "picnic-basket",
    name: "Picnic Basket",
    description: "Sunflowers and daisies for a sunny afternoon",
    vase: "basket",
    flowers: [
      { id: "sunflower", count: 4 },
      { id: "daisy", count: 5 },
      { id: "lavender", count: 3 },
    ],
  },
  {
    id: "just-because",
    name: "Just Because",
    description: "A small, sweet hello — no reason needed",
    vase: "newspaper",
    flowers: [
      { id: "tulip", count: 3 },
      { id: "babys-breath", count: 2 },
    ],
  },
];

export const VASES: VaseDefinition[] = [
  { id: "glass", name: "Glass Vase" },
  { id: "ribbon", name: "Ribbon Wrap" },
  { id: "kraft", name: "Kraft Paper" },
  { id: "newspaper", name: "Newspaper Wrap" },
  { id: "tissue", name: "Lilac Tissue" },
  { id: "mason", name: "Mason Jar" },
  { id: "pitcher", name: "Ceramic Pitcher" },
  { id: "basket", name: "Woven Basket" },
];

const MACLEOD_CREDIT = (title: string) =>
  `"${title}" Kevin MacLeod (incompetech.com), licensed under Creative Commons: By Attribution 3.0`;
const CC_BY_3 = "https://creativecommons.org/licenses/by/3.0/";

/**
 * Background music. Every recording is public domain or CC BY 3.0, sourced
 * from Wikimedia Commons. Files live in /public/music.
 */
export const MUSIC: MusicTrack[] = [
  {
    id: "clair-de-lune",
    title: "Clair de Lune",
    subtitle: "Debussy · U.S. Air Force Band, Wright Brass",
    mood: "Dreamy",
    src: "/music/clair-de-lune.mp3",
    chorusAt: 104,
    credit: "Performed by the Wright Brass, U.S. Air Force Band of Flight (public domain)",
    license: "Public domain",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Clair_de_Lune_-_Wright_Brass_-_United_States_Air_Force_Band_of_Flight.mp3",
  },
  {
    id: "liebestraum",
    title: "Liebestraum No. 3",
    subtitle: "Liszt · Wilhelm Backhaus, 1923",
    mood: "Vintage & tender",
    src: "/music/liebestraum.mp3",
    chorusAt: 108,
    credit: "Performed by Wilhelm Backhaus, recorded 1923 (public domain)",
    license: "Public domain",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:PDP-CH_-_Wilhelm_Backhaus_-_Liebestraum_No._3_in_A-flat_major,_S.541-3_(Liszt)_-_Hmv-d788-05754.flac",
  },
  {
    id: "canon-in-d",
    title: "Canon in D",
    subtitle: "Pachelbel · Kevin MacLeod",
    mood: "Wedding classic",
    src: "/music/canon-in-d.mp3",
    chorusAt: 140,
    credit: MACLEOD_CREDIT("Canon in D Major"),
    license: "CC BY 3.0",
    licenseUrl: CC_BY_3,
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Canon_in_D_Major_(ISRC_USUAN1100301).mp3",
  },
  {
    id: "gymnopedie",
    title: "Gymnopédie No. 1",
    subtitle: "Satie · Kevin MacLeod",
    mood: "Soft & calm",
    src: "/music/gymnopedie.mp3",
    chorusAt: 137,
    credit: MACLEOD_CREDIT("Gymnopedie No. 1"),
    license: "CC BY 3.0",
    licenseUrl: CC_BY_3,
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Gymnopedie_No._1_(ISRC_USUAN1100787).mp3",
  },
  {
    id: "love-song",
    title: "Love Song",
    subtitle: "Kevin MacLeod",
    mood: "Hopeful",
    src: "/music/love-song.mp3",
    chorusAt: 120,
    credit: MACLEOD_CREDIT("Love Song"),
    license: "CC BY 3.0",
    licenseUrl: CC_BY_3,
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Love_Song_(ISRC_USUAN1100170).mp3",
  },
  {
    id: "fairytale-waltz",
    title: "Fairytale Waltz",
    subtitle: "Kevin MacLeod",
    mood: "Whimsical",
    src: "/music/fairytale-waltz.mp3",
    chorusAt: 64,
    credit: MACLEOD_CREDIT("Fairytale Waltz"),
    license: "CC BY 3.0",
    licenseUrl: CC_BY_3,
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Fairytale_Waltz_(ISRC_USUAN1100232).mp3",
  },
];

export const THEMES: ThemeDefinition[] = [
  {
    id: "parchment",
    name: "Classic Parchment",
    cardClass: "bg-parchment text-ink border-[#e6d6b3]",
    swatchClass: "bg-parchment",
  },
  {
    id: "blush",
    name: "Soft Pastel Pink",
    cardClass: "bg-blush-100 text-ink border-blush-300",
    swatchClass: "bg-blush-200",
  },
  {
    id: "midnight",
    name: "Midnight Floral",
    cardClass: "bg-midnight text-cream border-[#3a3f6b]",
    swatchClass: "bg-midnight",
  },
];

const flowerIds = new Set<string>(FLOWERS.map((f) => f.id));
const vaseIds = new Set<string>(VASES.map((v) => v.id));
const themeIds = new Set<string>(THEMES.map((t) => t.id));
const musicIds = new Set<string>(MUSIC.map((m) => m.id));

export const isFlowerId = (v: unknown): v is FlowerId =>
  typeof v === "string" && flowerIds.has(v);
export const isVaseStyle = (v: unknown): v is VaseStyle =>
  typeof v === "string" && vaseIds.has(v);
export const isLetterTheme = (v: unknown): v is LetterTheme =>
  typeof v === "string" && themeIds.has(v);
export const isMusicTrackId = (v: unknown): v is MusicTrackId =>
  typeof v === "string" && musicIds.has(v);

export const getFlower = (id: FlowerId) => FLOWERS.find((f) => f.id === id)!;
export const getTheme = (id: LetterTheme) => THEMES.find((t) => t.id === id)!;
export const getVase = (id: VaseStyle) => VASES.find((v) => v.id === id)!;
export const getMusic = (id: MusicTrackId) => MUSIC.find((m) => m.id === id)!;
