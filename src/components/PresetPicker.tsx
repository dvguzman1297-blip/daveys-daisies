"use client";

import { motion } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import { useState } from "react";
import { PRESETS, getVase } from "@/lib/catalog";
import type { BouquetFlower, BouquetPreset, VaseStyle } from "@/types/bouquet";
import { FlowerRef } from "./flowers/FlowerArt";

interface PresetPickerProps {
  /** Prefix of a FlowerSprite on the page that holds the flower art. */
  spritePrefix: string;
  flowers: BouquetFlower[];
  vase: VaseStyle;
  onSelect: (preset: BouquetPreset) => void;
}

const matches = (preset: BouquetPreset, flowers: BouquetFlower[], vase: VaseStyle) =>
  preset.vase === vase &&
  preset.flowers.length === flowers.length &&
  preset.flowers.every((p) => flowers.some((f) => f.id === p.id && f.count === p.count));

/** Presets shown in the desktop grid before "Show more" (phones scroll through all). */
const INITIAL_VISIBLE = 6;

export function PresetPicker({ spritePrefix, flowers, vase, onSelect }: PresetPickerProps) {
  const [expanded, setExpanded] = useState(false);
  const hiddenCount = PRESETS.length - INITIAL_VISIBLE;

  return (
    <section aria-labelledby="presets-heading">
      <h2 id="presets-heading" className="font-display text-2xl text-ink">
        Start with a ready-made bouquet
      </h2>
      <p className="text-sm text-ink-soft">Pick one, then add or remove flowers to make it yours.</p>

      {/* Horizontal scroller on mobile, grid on larger screens */}
      <ul className="-mx-4 mt-3 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 sm:pb-0">
        {PRESETS.map((preset, index) => {
          const selected = matches(preset, flowers, vase);
          const total = preset.flowers.reduce((s, f) => s + f.count, 0);
          return (
            <li
              key={preset.id}
              className={`flex w-40 shrink-0 snap-start sm:w-auto ${!expanded && index >= INITIAL_VISIBLE ? "sm:hidden" : ""}`}
            >
              <motion.button
                type="button"
                onClick={() => onSelect(preset)}
                aria-pressed={selected}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className={`relative flex w-full flex-col items-center rounded-2xl border bg-white/80 p-3 text-center shadow-soft transition focus-visible:outline-2 focus-visible:outline-sage-500 ${
                  selected ? "border-sage-500 ring-2 ring-sage-200" : "border-sage-100 hover:border-sage-300"
                }`}
              >
                {selected && (
                  <span className="absolute right-2 top-2 grid size-5 place-items-center rounded-full bg-sage-700 text-white">
                    <Check className="size-3" aria-hidden="true" />
                  </span>
                )}
                <PresetCluster preset={preset} spritePrefix={spritePrefix} />
                {/* Two lines reserved on phones so descriptions start at the same height */}
                <span className="mt-1 flex min-h-10 items-center text-sm leading-tight font-bold text-ink sm:min-h-0">
                  {preset.name}
                </span>
                {/* flex-1 soaks up spare height, so the footer below sits at the bottom of every card */}
                <span className="mt-0.5 mb-2 flex-1 text-xs leading-snug text-ink-soft">{preset.description}</span>
                {/* Same size on every card: flower count over wrap name, never wrapping */}
                <span className="flex w-full flex-col items-center rounded-2xl bg-sage-100 px-2 py-1.5 text-[11px] leading-tight text-sage-700">
                  <span className="font-bold whitespace-nowrap">{total} flowers</span>
                  <span className="whitespace-nowrap">{getVase(preset.vase).name}</span>
                </span>              </motion.button>
            </li>
          );
        })}
      </ul>

      {hiddenCount > 0 && (
        <div className="mt-3 hidden justify-center sm:flex">
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            aria-expanded={expanded}
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold text-sage-700 transition hover:bg-sage-100 focus-visible:outline-2 focus-visible:outline-sage-500"
          >
            {expanded ? "Show fewer" : `Show ${hiddenCount} more`}
            <ChevronDown className={`size-4 transition-transform ${expanded ? "rotate-180" : ""}`} aria-hidden="true" />
          </button>
        </div>
      )}
    </section>
  );
}

/** Small overlapping cluster of the preset's three most plentiful flowers. */
function PresetCluster({ preset, spritePrefix }: { preset: BouquetPreset; spritePrefix: string }) {
  const top = [...preset.flowers].sort((a, b) => b.count - a.count).slice(0, 3);
  // Draw sides first, then the most plentiful flower in front-centre.
  const slots = [
    { x: 0, y: -6, s: 0.8 },
    { x: -30, y: 8, s: 0.68 },
    { x: 30, y: 8, s: 0.68 },
  ];
  const placed = top.map((f, i) => ({ ...f, ...slots[i] })).reverse();
  return (
    <svg viewBox="-62 -42 124 82" className="h-16 w-24" aria-hidden="true">
      {placed.map((f) => (
        <g key={f.id} transform={`translate(${f.x} ${f.y}) scale(${f.s})`}>
          <FlowerRef id={f.id} prefix={spritePrefix} />
        </g>
      ))}
    </svg>
  );
}
