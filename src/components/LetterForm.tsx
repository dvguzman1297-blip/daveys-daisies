"use client";

import { motion } from "framer-motion";
import { Check, EyeOff, User } from "lucide-react";
import { ANONYMOUS_SIGNATURE, MAX_MESSAGE_LENGTH, MAX_NAME_LENGTH, THEMES, getTheme } from "@/lib/catalog";
import type { LetterDraft, LetterTheme } from "@/types/bouquet";
import { MusicPicker } from "./MusicPicker";
import { VoiceRecorder } from "./VoiceRecorder";

interface LetterFormProps {
  value: LetterDraft;
  onChange: (next: LetterDraft) => void;
  /** Field name -> error message, shown after a submit attempt. */
  errors?: Partial<Record<keyof LetterDraft, string>>;
}

export function LetterForm({ value, onChange, errors = {} }: LetterFormProps) {
  const theme = getTheme(value.theme);
  const dark = value.theme === "midnight";
  const remaining = MAX_MESSAGE_LENGTH - value.message.length;
  const set = <K extends keyof LetterDraft>(key: K, v: LetterDraft[K]) =>
    onChange({ ...value, [key]: v });

  const inputClass = `w-full rounded-lg border-0 border-b-2 bg-transparent px-1 py-1 font-hand text-2xl outline-none transition focus:ring-0 ${
    dark
      ? "border-white/20 placeholder:text-cream/40 focus:border-butter-300"
      : "border-ink/15 placeholder:text-ink/30 focus:border-blush-500"
  }`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotateX: -25, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 140, damping: 18 }}
      style={{ transformPerspective: 1000 }}
      className="flex flex-col gap-4"
    >
      <fieldset>
        <legend className="mb-2 font-display text-lg text-ink">Letter style</legend>
        <div className="flex flex-wrap gap-2">
          {THEMES.map((t) => {
            const selected = t.id === value.theme;
            return (
              <label
                key={t.id}
                className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold transition has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-sage-500 ${
                  selected ? "border-sage-500 bg-sage-100 text-sage-700" : "border-sage-100 bg-white/70 text-ink-soft hover:border-sage-300"
                }`}
              >
                <input
                  type="radio"
                  name="letter-theme"
                  value={t.id}
                  checked={selected}
                  onChange={() => set("theme", t.id as LetterTheme)}
                  className="sr-only"
                />
                <span className={`grid size-5 place-items-center rounded-full border border-black/10 ${t.swatchClass}`}>
                  {selected && <Check className={`size-3 ${t.id === "midnight" ? "text-cream" : "text-ink"}`} aria-hidden="true" />}
                </span>
                {t.name}
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className={`theme-${value.theme} rounded-3xl border p-5 shadow-soft sm:p-7 ${theme.cardClass}`}>
        <fieldset className="mb-5">
          <legend className="sr-only">How should the letter be signed?</legend>
          <div className={`inline-flex rounded-full p-1 ${dark ? "bg-white/10" : "bg-black/5"}`}>
            {[
              { anonymous: false, label: "With my name", icon: User },
              { anonymous: true, label: "Anonymously", icon: EyeOff },
            ].map(({ anonymous, label, icon: Icon }) => {
              const active = value.anonymous === anonymous;
              return (
                <label
                  key={label}
                  className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-bold transition has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-sage-500 ${
                    active
                      ? "bg-white text-ink shadow-soft"
                      : dark
                        ? "text-cream/70 hover:text-cream"
                        : "text-ink-soft hover:text-ink"
                  }`}
                >
                  <input
                    type="radio"
                    name="letter-mode"
                    checked={active}
                    onChange={() => set("anonymous", anonymous)}
                    className="sr-only"
                  />
                  <Icon className="size-4" aria-hidden="true" />
                  {label}
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="To" error={errors.to} dark={dark} htmlFor="letter-to">
            <input
              id="letter-to"
              value={value.to}
              maxLength={MAX_NAME_LENGTH}
              onChange={(e) => set("to", e.target.value)}
              placeholder="My dearest…"
              autoComplete="off"
              aria-invalid={!!errors.to}
              className={inputClass}
            />
          </Field>
          {value.anonymous ? (
            <Field label="Sign as (optional)" dark={dark} htmlFor="letter-nickname">
              <input
                id="letter-nickname"
                value={value.nickname}
                maxLength={MAX_NAME_LENGTH}
                onChange={(e) => set("nickname", e.target.value)}
                placeholder={ANONYMOUS_SIGNATURE}
                autoComplete="off"
                className={inputClass}
              />
            </Field>
          ) : (
            <Field label="From" error={errors.from} dark={dark} htmlFor="letter-from">
              <input
                id="letter-from"
                value={value.from}
                maxLength={MAX_NAME_LENGTH}
                onChange={(e) => set("from", e.target.value)}
                placeholder="Your name"
                autoComplete="name"
                aria-invalid={!!errors.from}
                className={inputClass}
              />
            </Field>
          )}
        </div>

        {value.anonymous && (
          <p className={`mt-2 text-xs ${dark ? "text-cream/60" : "text-ink-soft"}`}>
            Your name is never shown. Leave &ldquo;Sign as&rdquo; empty to sign as &ldquo;{ANONYMOUS_SIGNATURE}&rdquo;.
          </p>
        )}

        <Field label="Your letter" error={errors.message} dark={dark} htmlFor="letter-message" className="mt-5">
          <textarea
            id="letter-message"
            value={value.message}
            maxLength={MAX_MESSAGE_LENGTH}
            onChange={(e) => set("message", e.target.value)}
            rows={7}
            placeholder="Write something from the heart…"
            aria-invalid={!!errors.message}
            aria-describedby="letter-count"
            className={`letter-lines max-h-[26rem] w-full resize-none overflow-y-auto border-0 bg-transparent px-1 font-hand text-2xl outline-none focus:ring-0 ${
              dark ? "placeholder:text-cream/40" : "placeholder:text-ink/30"
            }`}
          />
        </Field>
        {/* Only worth showing as the limit gets close. */}
        <p
          id="letter-count"
          aria-live="polite"
          className={`mt-1 text-right text-xs font-semibold tabular-nums ${
            remaining < 50 ? (dark ? "text-blush-300" : "text-blush-700") : dark ? "text-cream/60" : "text-ink-soft"
          }`}
        >
          {remaining < 500 ? `${remaining} characters left` : ""}
        </p>
      </div>

      <MusicPicker value={value.music} youtube={value.youtube} onChange={(source) => onChange({ ...value, ...source })} />

      <VoiceRecorder value={value.voice} anonymous={value.anonymous} onChange={(voice) => onChange({ ...value, voice })} />
    </motion.div>
  );
}

function Field({
  label,
  htmlFor,
  error,
  dark,
  className = "",
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  dark: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label
        htmlFor={htmlFor}
        className={`block text-xs font-bold uppercase tracking-widest ${dark ? "text-cream/70" : "text-ink-soft"}`}
      >
        {label}
      </label>
      {children}
      {error && (
        <p role="alert" className={`mt-1 text-sm font-semibold ${dark ? "text-blush-300" : "text-blush-700"}`}>
          {error}
        </p>
      )}
    </div>
  );
}
