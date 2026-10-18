"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { PRESETS } from "@/lib/catalog";
import type { BouquetFlower, BouquetPreset, VaseStyle } from "@/types/bouquet";
import { FlowerDefs, FlowerHead } from "./flowers/FlowerArt";

interface PresetPickerProps {
  flowers: BouquetFlower[];
  vase: VaseStyle;
  onSelect: (preset: BouquetPreset) => void;
}

const matches = (preset: BouquetPreset, flowers: BouquetFlower[], vase: VaseStyle) =>
  preset.vase === vase &&
  preset.flowers.length === flowers.length &&
  preset.flowers.every((p) => flowers.some((f) => f.id === p.id && f.count === p.count));

export function PresetPicker({ flowers, vase, onSelect }: PresetPickerProps) {
  return (
    <section aria-labelledby="presets-heading">
      <h2 id="presets-heading" className="font-display text-2xl text-ink">
        Start with a ready-made bouquet
      </h2>
      <p className="text-sm text-ink-soft">Pick one, then add or remove flowers to make it yours.</p>

      {/* Horizontal scroller on mobile, grid on larger screens */}
      <ul className="-mx-4 mt-3 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 sm:pb-0">
        {PRESETS.map((preset) => {
          const selected = matches(preset, flowers, vase);
          const total = preset.flowers.reduce((s, f) => s + f.count, 0);
          return (
            <li key={preset.id} className="w-40 shrink-0 snap-start sm:w-auto">
              <motion.button
                type="button"
                onClick={() => onSelect(preset)}
                aria-pressed={selected}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className={`relative flex h-full w-full flex-col items-center rounded-2xl border bg-white/80 p-3 text-center shadow-soft transition focus-visible:outline-2 focus-visible:outline-sage-500 ${
                  selected ? "border-sage-500 ring-2 ring-sage-200" : "border-sage-100 hover:border-sage-300"
                }`}
              >
                {selected && (
                  <span className="absolute right-2 top-2 grid size-5 place-items-center rounded-full bg-sage-700 text-white">
                    <Check className="size-3" aria-hidden="true" />
                  </span>
                )}
                <PresetCluster preset={preset} />
                <span className="mt-1 text-sm font-bold text-ink">{preset.name}</span>
                <span className="text-xs text-ink-soft">{preset.description}</span>
                <span className="mt-1.5 rounded-full bg-sage-100 px-2 py-0.5 text-[11px] font-bold text-sage-700">
                  {total} flowers
                </span>
              </motion.button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** Small overlapping cluster of the preset's three most plentiful flowers. */
function PresetCluster({ preset }: { preset: BouquetPreset }) {
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
      <FlowerDefs />
      {placed.map((f) => (
        <g key={f.id} transform={`translate(${f.x} ${f.y}) scale(${f.s})`}>
          <FlowerHead id={f.id} />
        </g>
      ))}
    </svg>
  );
}
