import type {
  BouquetPreset,
  FlowerDefinition,
  FlowerId,
  LetterTheme,
  ThemeDefinition,
  VaseDefinition,
  VaseStyle,
} from "@/types/bouquet";

export const MAX_FLOWERS = 20;
export const MAX_MESSAGE_LENGTH = 500;
export const MAX_NAME_LENGTH = 40;

export const FLOWERS: FlowerDefinition[] = [
  { id: "daisy", name: "Daisy", meaning: "Innocence & joy" },
  { id: "sunflower", name: "Sunflower", meaning: "Warmth & loyalty" },
  { id: "rose", name: "Rose", meaning: "Love & admiration" },
  { id: "tulip", name: "Tulip", meaning: "Perfect love" },
  { id: "babys-breath", name: "Baby's Breath", meaning: "Everlasting love" },
  { id: "lavender", name: "Lavender", meaning: "Devotion & calm" },
];

export const PRESETS: BouquetPreset[] = [
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

export const isFlowerId = (v: unknown): v is FlowerId =>
  typeof v === "string" && flowerIds.has(v);
export const isVaseStyle = (v: unknown): v is VaseStyle =>
  typeof v === "string" && vaseIds.has(v);
export const isLetterTheme = (v: unknown): v is LetterTheme =>
  typeof v === "string" && themeIds.has(v);

export const getFlower = (id: FlowerId) => FLOWERS.find((f) => f.id === id)!;
export const getTheme = (id: LetterTheme) => THEMES.find((t) => t.id === id)!;
export const getVase = (id: VaseStyle) => VASES.find((v) => v.id === id)!;
