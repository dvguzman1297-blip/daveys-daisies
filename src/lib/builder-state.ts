import { ANONYMOUS_SIGNATURE, MAX_FLOWERS, getFlower } from "@/lib/catalog";
import { totalFlowers } from "@/lib/arrangement";
import type { BouquetPreset, BuilderState, FlowerId, LetterDraft, VaseStyle } from "@/types/bouquet";

export type BuilderAction =
  | { type: "add"; id: FlowerId }
  | { type: "remove"; id: FlowerId }
  | { type: "clear" }
  | { type: "loadPreset"; preset: BouquetPreset }
  | { type: "setVase"; vase: VaseStyle }
  | { type: "setLetter"; letter: LetterDraft };

export const initialBuilderState: BuilderState = {
  flowers: [],
  vase: "ribbon",
  letter: { to: "", from: "", message: "", theme: "parchment", music: null, youtube: null, recipientEmail: "", anonymous: false, nickname: "" },
};

export function builderReducer(state: BuilderState, action: BuilderAction): BuilderState {
  switch (action.type) {
    case "add": {
      if (totalFlowers(state.flowers) >= MAX_FLOWERS) return state;
      const exists = state.flowers.some((f) => f.id === action.id);
      return {
        ...state,
        flowers: exists
          ? state.flowers.map((f) => (f.id === action.id ? { ...f, count: f.count + 1 } : f))
          : [...state.flowers, { id: action.id, name: getFlower(action.id).name, count: 1 }],
      };
    }
    case "remove":
      return {
        ...state,
        flowers: state.flowers
          .map((f) => (f.id === action.id ? { ...f, count: f.count - 1 } : f))
          .filter((f) => f.count > 0),
      };
    case "clear":
      return { ...state, flowers: [] };
    case "loadPreset":
      return {
        ...state,
        vase: action.preset.vase,
        flowers: action.preset.flowers.map(({ id, count }) => ({ id, name: getFlower(id).name, count })),
      };
    case "setVase":
      return { ...state, vase: action.vase };
    case "setLetter":
      return { ...state, letter: action.letter };
  }
}

/**
 * How the letter is signed. When sending anonymously the real name in `from` is never
 * used, so it can't leak even if it was typed before switching modes.
 */
export const signatureOf = (letter: LetterDraft) =>
  letter.anonymous ? letter.nickname.trim() || ANONYMOUS_SIGNATURE : letter.from.trim();

export function validateLetter(letter: LetterDraft): Partial<Record<keyof LetterDraft, string>> {
  const errors: Partial<Record<keyof LetterDraft, string>> = {};
  if (!letter.to.trim()) errors.to = "Who is this bouquet for?";
  if (!letter.anonymous && !letter.from.trim()) errors.from = "Let them know who it's from.";
  if (!letter.message.trim()) errors.message = "Write a few words from the heart.";
  return errors;
}
