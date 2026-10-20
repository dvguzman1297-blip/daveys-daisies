"use client";

import { motion } from "framer-motion";
import { Minus, Plus, RotateCcw } from "lucide-react";
import { FLOWERS, MAX_FLOWERS } from "@/lib/catalog";
import type { BouquetFlower, FlowerId } from "@/types/bouquet";
import { FLOWER_DRAG_TYPE } from "./BouquetCanvas";
import { FlowerThumbnail } from "./flowers/FlowerArt";

interface FlowerPickerProps {
  /** Prefix of a FlowerSprite on the page that holds the flower art. */
  spritePrefix: string;
  flowers: BouquetFlower[];
  total: number;
  onAdd: (id: FlowerId) => void;
  onRemove: (id: FlowerId) => void;
  onClear: () => void;
}

export function FlowerPicker({ spritePrefix, flowers, total, onAdd, onRemove, onClear }: FlowerPickerProps) {
  const full = total >= MAX_FLOWERS;
  const countOf = (id: FlowerId) => flowers.find((f) => f.id === id)?.count ?? 0;

  return (
    <section aria-labelledby="picker-heading" className="flex flex-col gap-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 id="picker-heading" className="font-display text-2xl text-ink">
            Or pick your own
          </h2>
          <p className="text-sm text-ink-soft">Tap to add, or drag onto the vase.</p>
        </div>
        <button
          type="button"
          onClick={onClear}
          disabled={total === 0}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold text-ink-soft transition hover:bg-blush-100 hover:text-blush-700 focus-visible:outline-2 focus-visible:outline-blush-500 disabled:opacity-40 disabled:hover:bg-transparent"
        >
          <RotateCcw className="size-4" aria-hidden="true" />
          Clear
        </button>
      </div>

      {/* Total counter */}
      <div>
        <div className="mb-1.5 flex justify-between text-sm font-semibold">
          <span className="text-ink-soft">Bouquet size</span>
          <span className={full ? "text-blush-700" : "text-sage-700"} aria-live="polite">
            {total} / {MAX_FLOWERS} {full && "· full!"}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-sage-100">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-sage-300 via-butter-300 to-blush-300"
            animate={{ width: `${(total / MAX_FLOWERS) * 100}%` }}
            transition={{ type: "spring", stiffness: 200, damping: 24 }}
          />
        </div>
      </div>

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {FLOWERS.map((flower) => {
          const count = countOf(flower.id);
          return (
            <li key={flower.id}>
              <div
                draggable={!full}
                onDragStart={(e) => {
                  e.dataTransfer.setData(FLOWER_DRAG_TYPE, flower.id);
                  e.dataTransfer.effectAllowed = "copy";
                }}
                className={`group relative flex h-full flex-col items-center rounded-2xl border bg-white/80 p-3 shadow-soft transition ${
                  count > 0 ? "border-sage-300 ring-2 ring-sage-200" : "border-sage-100"
                }`}
              >
                <button
                  type="button"
                  onClick={() => onAdd(flower.id)}
                  disabled={full}
                  aria-label={`Add a ${flower.name}`}
                  className="flex w-full flex-col items-center rounded-xl focus-visible:outline-2 focus-visible:outline-sage-500 disabled:cursor-not-allowed"
                >
                  <motion.span
                    className="block"
                    whileHover={full ? undefined : { scale: 1.08, rotate: -4 }}
                    whileTap={full ? undefined : { scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  >
                    <FlowerThumbnail id={flower.id} spritePrefix={spritePrefix} className="size-16 sm:size-20" />
                  </motion.span>
                  <span className="mt-1 text-sm font-bold text-ink">{flower.name}</span>
                  <span className="text-xs text-ink-soft">{flower.meaning}</span>
                </button>

                <div className="mt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onRemove(flower.id)}
                    disabled={count === 0}
                    aria-label={`Remove a ${flower.name}`}
                    className="grid size-7 place-items-center rounded-full bg-sage-100 text-sage-700 transition hover:bg-sage-200 focus-visible:outline-2 focus-visible:outline-sage-500 disabled:opacity-30"
                  >
                    <Minus className="size-3.5" aria-hidden="true" />
                  </button>
                  <motion.span
                    key={count}
                    initial={{ scale: 1.5 }}
                    animate={{ scale: 1 }}
                    className="w-5 text-center text-sm font-bold tabular-nums text-ink"
                    aria-label={`${count} ${flower.name} in bouquet`}
                  >
                    {count}
                  </motion.span>
                  <button
                    type="button"
                    onClick={() => onAdd(flower.id)}
                    disabled={full}
                    aria-label={`Add a ${flower.name}`}
                    className="grid size-7 place-items-center rounded-full bg-sage-100 text-sage-700 transition hover:bg-sage-200 focus-visible:outline-2 focus-visible:outline-sage-500 disabled:opacity-30"
                  >
                    <Plus className="size-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
