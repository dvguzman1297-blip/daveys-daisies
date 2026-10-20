"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, EyeOff, Flower2, Link2, Loader2, Mail, Mic, Music, PenLine, Sparkles, User } from "lucide-react";
import { useCallback, useId, useMemo, useReducer, useRef, useState, useTransition } from "react";
import { createBouquet } from "@/app/actions";
import { totalFlowers } from "@/lib/arrangement";
import { getMusic } from "@/lib/catalog";
import { normalizeEmail } from "@/lib/email/address";
import { uploadVoice } from "@/lib/voice-upload";
import { formatTime } from "@/lib/youtube";
import { builderReducer, initialBuilderState, signatureOf, validateLetter } from "@/lib/builder-state";
import type { EmailOutcome, LetterDraft } from "@/types/bouquet";
import { BouquetCanvas } from "./BouquetCanvas";
import { FlowerPicker } from "./FlowerPicker";
import { FlowerSprite } from "./flowers/FlowerArt";
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

export function BouquetBuilder({ initialAnonymous = false }: { initialAnonymous?: boolean }) {
  const [state, dispatch] = useReducer(builderReducer, initialAnonymous, (anonymous) => ({
    ...initialBuilderState,
    letter: { ...initialBuilderState.letter, anonymous },
  }));
  const [step, setStep] = useState(0);
  const spritePrefix = `bb${useId().replace(/:/g, "")}-`;
  const [letterErrors, setLetterErrors] = useState<Partial<Record<keyof LetterDraft, string>>>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailOutcome, setEmailOutcome] = useState<EmailOutcome | null>(null);
  const [saving, startSaving] = useTransition();
  const uploadedVoice = useRef<{ blob: Blob; path: string } | null>(null);

  const total = totalFlowers(state.flowers);
  const shareUrl = useMemo(
    () => (savedId && typeof window !== "undefined" ? `${window.location.origin}/b/${savedId}` : ""),
    [savedId],
  );

  // Any edit after saving means the shared link would be stale, so require a new save.
  const edit = useCallback((action: Parameters<typeof dispatch>[0]) => {
    setSavedId(null);
    setEmailOutcome(null);
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
    const recipientEmail = state.letter.recipientEmail.trim();
    if (recipientEmail && !normalizeEmail(recipientEmail)) {
      setEmailError("That email address doesn't look right.");
      return;
    }
    setEmailError(null);
    startSaving(async () => {
      // Upload the voice message first. A retry reuses the file if nothing about the recording changed.
      let voice: { path: string; seconds: number } | null = null;
      const draft = state.letter.voice;
      if (draft) {
        if (uploadedVoice.current?.blob !== draft.blob) {
          const uploaded = await uploadVoice(draft);
          if (!uploaded.ok) return setSaveError(uploaded.error);
          uploadedVoice.current = { blob: draft.blob, path: uploaded.path };
        }
        voice = { path: uploadedVoice.current.path, seconds: draft.seconds };
      }
      const res = await createBouquet({
        senderName: signatureOf(state.letter),
        recipientName: state.letter.to,
        message: state.letter.message,
        theme: state.letter.theme,
        vaseStyle: state.vase,
        flowers: state.flowers.map(({ id, count }) => ({ id, count })),
        music: state.letter.music,
        youtube: state.letter.youtube && {
          videoId: state.letter.youtube.videoId,
          start: state.letter.youtube.start,
          end: state.letter.youtube.end,
        },
        recipientEmail: recipientEmail || null,
        anonymous: state.letter.anonymous,
        voice,
      });
      if (res.ok) {
        setEmailOutcome(res.email ?? null);
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
                  {/* One copy of the flower art, shared by every thumbnail and preset card below */}
                  <FlowerSprite prefix={spritePrefix} />
                  <PresetPicker
                    flowers={state.flowers}
                    vase={state.vase}
                    spritePrefix={spritePrefix}
                    onSelect={(preset) => edit({ type: "loadPreset", preset })}
                  />
                  <FlowerPicker
                    spritePrefix={spritePrefix}
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
                    from={signatureOf(state.letter)}
                    message={state.letter.message}
                    theme={state.letter.theme}
                  />
                  {(state.letter.music || state.letter.youtube) && (
                    <p className="inline-flex max-w-full items-center gap-2 self-start rounded-full bg-blush-100 px-3 py-1.5 text-sm font-semibold text-blush-700">
                      <Music className="size-4 shrink-0" aria-hidden="true" />
                      <span className="truncate">
                        {state.letter.youtube
                          ? `Plays ${formatTime(state.letter.youtube.start)}–${formatTime(state.letter.youtube.end)} of ${state.letter.youtube.title} when opened`
                          : `Plays ${getMusic(state.letter.music!).title} when opened`}
                      </span>
                    </p>
                  )}
                  {state.letter.voice && (
                    <p className="inline-flex items-center gap-2 self-start rounded-full bg-blush-100 px-3 py-1.5 text-sm font-semibold text-blush-700">
                      <Mic className="size-4 shrink-0" aria-hidden="true" />
                      Includes your {formatTime(state.letter.voice.seconds)} voice message
                    </p>
                  )}
                  <div className="rounded-3xl border border-sage-100 bg-white/70 p-5 shadow-soft">
                    <h3 className="flex items-center gap-2 font-display text-lg text-ink">
                      <Mail className="size-5 text-sage-700" aria-hidden="true" />
                      Email it to {state.letter.to.trim() || "them"}?
                      <span className="font-sans text-sm font-semibold text-ink-soft">Optional</span>
                    </h3>
                    <p className="mt-1 text-sm text-ink-soft">
                      We&apos;ll email them a link to open your letter. The email never includes what you wrote.
                    </p>
                    <label htmlFor="recipient-email" className="sr-only">
                      Their email address
                    </label>
                    <input
                      id="recipient-email"
                      type="email"
                      inputMode="email"
                      autoComplete="off"
                      value={state.letter.recipientEmail}
                      onChange={(e) => {
                        setEmailError(null);
                        edit({ type: "setLetter", letter: { ...state.letter, recipientEmail: e.target.value } });
                      }}
                      placeholder="their@email.com"
                      maxLength={254}
                      aria-invalid={!!emailError}
                      aria-describedby={emailError ? "recipient-email-error" : undefined}
                      className="mt-3 w-full rounded-xl border border-sage-200 bg-white px-3 py-2.5 text-base text-ink outline-none transition placeholder:text-ink-soft/60 focus:border-sage-500"
                    />
                    {emailError && (
                      <p id="recipient-email-error" role="alert" className="mt-1 text-sm font-semibold text-blush-700">
                        {emailError}
                      </p>
                    )}

                    <p className="mt-4 flex items-start gap-2.5 rounded-2xl bg-sage-100/60 p-3 text-sm text-ink-soft">
                      {state.letter.anonymous ? (
                        <>
                          <EyeOff className="mt-0.5 size-4 shrink-0 text-sage-700" aria-hidden="true" />
                          <span>
                            <strong className="text-ink">Sending anonymously.</strong> Your name stays off the email,
                            the top of the page and link previews. The letter is signed &ldquo;
                            {signatureOf(state.letter)}&rdquo;.
                          </span>
                        </>
                      ) : (
                        <>
                          <User className="mt-0.5 size-4 shrink-0 text-sage-700" aria-hidden="true" />
                          <span>
                            Your name will show on the email and the letter. To hide it, go back and choose{" "}
                            <strong className="text-ink">Anonymously</strong> on the letter step.
                          </span>
                        </>
                      )}
                    </p>
                  </div>
                  {saveError && (
                    <p role="alert" className="rounded-xl bg-blush-100 px-4 py-3 text-sm font-semibold text-blush-700">
                      {saveError}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={save}
                    disabled={saving}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-blush-700 px-6 py-4 text-lg font-bold text-white shadow-soft transition hover:bg-blush-700/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blush-700 disabled:opacity-70"
                  >
                    {saving ? (
                      <Loader2 className="size-5 animate-spin" aria-hidden="true" />
                    ) : (
                      <Sparkles className="size-5" aria-hidden="true" />
                    )}
                    {saving
                      ? "Wrapping your bouquet…"
                      : savedId
                        ? "Show share link"
                        : state.letter.recipientEmail.trim()
                          ? "Create link & email it"
                          : "Create shareable link"}
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
        email={emailOutcome}
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
