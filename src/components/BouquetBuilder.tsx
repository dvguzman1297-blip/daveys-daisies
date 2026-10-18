"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Flower2, Link2, Loader2, Music, PenLine, Sparkles } from "lucide-react";
import { useCallback, useMemo, useReducer, useState, useTransition } from "react";
import { createBouquet } from "@/app/actions";
import { totalFlowers } from "@/lib/arrangement";
import { getMusic } from "@/lib/catalog";
import { builderReducer, initialBuilderState, validateLetter } from "@/lib/builder-state";
import type { LetterDraft } from "@/types/bouquet";
import { BouquetCanvas } from "./BouquetCanvas";
import { FlowerPicker } from "./FlowerPicker";
import { LetterCard } from "./LetterCard";
import { LetterForm } from "./LetterForm";
import { PresetPicker } from "./PresetPicker";
import { ShareModal } from "./ShareModal";
import { VasePicker } from "./VasePicker";

const STEPS = [
  { label: "Flowers", icon: Flower2 },
  { label: "Letter", icon: PenLine },
  { label: "Send", icon: Link2 },
] as const;

export function BouquetBuilder() {
  const [state, dispatch] = useReducer(builderReducer, initialBuilderState);
  const [step, setStep] = useState(0);
  const [letterErrors, setLetterErrors] = useState<Partial<Record<keyof LetterDraft, string>>>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [saving, startSaving] = useTransition();

  const total = totalFlowers(state.flowers);
  const shareUrl = useMemo(
    () => (savedId && typeof window !== "undefined" ? `${window.location.origin}/b/${savedId}` : ""),
    [savedId],
  );

  // Any edit after saving means the shared link would be stale, so require a new save.
  const edit = useCallback((action: Parameters<typeof dispatch>[0]) => {
    setSavedId(null);
    dispatch(action);
  }, []);

  const goNext = () => {
    if (step === 1) {
      const errors = validateLetter(state.letter);
      setLetterErrors(errors);
      if (Object.keys(errors).length) return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const save = () => {
    if (savedId) return setShareOpen(true);
    setSaveError(null);
    startSaving(async () => {
      const res = await createBouquet({
        senderName: state.letter.from,
        recipientName: state.letter.to,
        message: state.letter.message,
        theme: state.letter.theme,
        vaseStyle: state.vase,
        flowers: state.flowers.map(({ id, count }) => ({ id, count })),
        music: state.letter.music,
      });
      if (res.ok) {
        setSavedId(res.id);
        setShareOpen(true);
      } else {
        setSaveError(res.error);
      }
    });
  };

  const canAdvance = step === 0 ? total > 0 : true;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-32 pt-6 sm:px-6 lg:pb-12">
      <StepIndicator step={step} onSelect={(i) => i < step && setStep(i)} />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-10">
        {/* Live preview */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <div className="paper-dots relative overflow-hidden rounded-[2rem] border border-sage-100 bg-white/60 shadow-soft">
            <BouquetCanvas
              flowers={state.flowers}
              vase={state.vase}
              mode={step === 0 ? "edit" : "view"}
              onAddFlower={(id) => edit({ type: "add", id })}
              onRemoveFlower={(id) => edit({ type: "remove", id })}
              className={`mx-auto aspect-[4/5] w-full transition-[max-width] duration-500 ${
                step === 0 ? "max-w-md" : "max-w-[15rem] lg:max-w-md"
              }`}
            />
          </div>
          {step === 0 && total > 0 && (
            <p className="mt-2 text-center text-xs text-ink-soft">Tip: tap a flower in the vase to remove it.</p>
          )}
        </div>

        {/* Step panel */}
        <div className="min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
            >
              {step === 0 && (
                <div className="flex flex-col gap-8">
                  <PresetPicker
                    flowers={state.flowers}
                    vase={state.vase}
                    onSelect={(preset) => edit({ type: "loadPreset", preset })}
                  />
                  <FlowerPicker
                    flowers={state.flowers}
                    total={total}
                    onAdd={(id) => edit({ type: "add", id })}
                    onRemove={(id) => edit({ type: "remove", id })}
                    onClear={() => edit({ type: "clear" })}
                  />
                  <VasePicker value={state.vase} onChange={(vase) => edit({ type: "setVase", vase })} />
                </div>
              )}

              {step === 1 && (
                <div>
                  <h2 className="mb-4 font-display text-2xl text-ink">Write your letter</h2>
                  <LetterForm
                    value={state.letter}
                    errors={letterErrors}
                    onChange={(letter) => edit({ type: "setLetter", letter })}
                  />
                </div>
              )}

              {step === 2 && (
                <div className="flex flex-col gap-5">
                  <div>
                    <h2 className="font-display text-2xl text-ink">Ready to send?</h2>
                    <p className="text-sm text-ink-soft">
                      Here&apos;s what {state.letter.to.trim()} will see when they open your letter.
                    </p>
                  </div>
                  <LetterCard
                    to={state.letter.to}
                    from={state.letter.from}
                    message={state.letter.message}
                    theme={state.letter.theme}
                  />
                  {state.letter.music && (
                    <p className="inline-flex items-center gap-2 self-start rounded-full bg-blush-100 px-3 py-1.5 text-sm font-semibold text-blush-700">
                      <Music className="size-4" aria-hidden="true" />
                      Plays {getMusic(state.letter.music).title} when opened
                    </p>
                  )}
                  {saveError && (
                    <p role="alert" className="rounded-xl bg-blush-100 px-4 py-3 text-sm font-semibold text-blush-700">
                      {saveError}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={save}
                    disabled={saving}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-blush-500 px-6 py-4 text-lg font-bold text-white shadow-soft transition hover:bg-blush-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blush-500 disabled:opacity-70"
                  >
                    {saving ? (
                      <Loader2 className="size-5 animate-spin" aria-hidden="true" />
                    ) : (
                      <Sparkles className="size-5" aria-hidden="true" />
                    )}
                    {saving ? "Wrapping your bouquet…" : savedId ? "Show share link" : "Create shareable link"}
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation — fixed to the bottom on mobile, inline on desktop */}
          <div className="fixed inset-x-0 bottom-0 z-30 border-t border-sage-100 bg-cream/90 px-4 py-3 backdrop-blur lg:static lg:mt-8 lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setStep((s) => Math.max(s - 1, 0))}
                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 font-bold text-ink-soft transition hover:bg-sage-100 focus-visible:outline-2 focus-visible:outline-sage-500 ${
                  step === 0 ? "invisible" : ""
                }`}
              >
                <ArrowLeft className="size-4" aria-hidden="true" />
                Back
              </button>
              {step < STEPS.length - 1 && (
                <button
                  type="button"
                  onClick={goNext}
                  disabled={!canAdvance}
                  className="inline-flex items-center gap-1.5 rounded-full bg-sage-700 px-6 py-2.5 font-bold text-white shadow-soft transition hover:bg-sage-700/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-500 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {step === 0 ? "Write a letter" : "Review"}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <ShareModal
        open={shareOpen && !!shareUrl}
        url={shareUrl}
        recipientName={state.letter.to.trim()}
        onClose={() => setShareOpen(false)}
      />
    </div>
  );
}

function StepIndicator({ step, onSelect }: { step: number; onSelect: (i: number) => void }) {
  return (
    <nav aria-label="Progress">
      <ol className="flex items-center justify-center gap-2 sm:gap-4">
        {STEPS.map(({ label, icon: Icon }, i) => {
          const state = i < step ? "done" : i === step ? "current" : "todo";
          return (
            <li key={label} className="flex items-center gap-2 sm:gap-4">
              <button
                type="button"
                onClick={() => onSelect(i)}
                disabled={i >= step}
                aria-current={state === "current" ? "step" : undefined}
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-bold transition focus-visible:outline-2 focus-visible:outline-sage-500 ${
                  state === "current"
                    ? "bg-sage-700 text-white"
                    : state === "done"
                      ? "bg-sage-100 text-sage-700 hover:bg-sage-200"
                      : "text-ink-soft"
                }`}
              >
                <Icon className="size-4" aria-hidden="true" />
                <span className={state === "current" ? "" : "sr-only sm:not-sr-only"}>
                  {i + 1}. {label}
                </span>
              </button>
              {i < STEPS.length - 1 && <span className="h-px w-6 bg-sage-300 sm:w-10" aria-hidden="true" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
