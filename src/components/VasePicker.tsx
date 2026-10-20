"use client";

import { VASES } from "@/lib/catalog";
import type { VaseStyle } from "@/types/bouquet";
import { VaseDefs, VaseFront } from "./VaseArt";

interface VasePickerProps {
  value: VaseStyle;
  onChange: (vase: VaseStyle) => void;
}

export function VasePicker({ value, onChange }: VasePickerProps) {
  return (
    <fieldset>
      <legend className="mb-2 font-display text-lg text-ink">Choose a wrap or vase</legend>
      {/* Gradients and filters shared by all the icons below */}
      <svg width={0} height={0} aria-hidden="true" focusable="false" style={{ position: "absolute" }}>
        <VaseDefs />
      </svg>
      <div className="grid grid-cols-4 gap-2" role="radiogroup">
        {VASES.map((vase) => {
          const selected = vase.id === value;
          return (
            <label
              key={vase.id}
              className={`flex cursor-pointer flex-col items-center rounded-2xl border p-2 text-center text-xs leading-tight font-semibold transition has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-sage-500 ${
                selected
                  ? "border-sage-500 bg-sage-100 text-sage-700"
                  : "border-sage-100 bg-white/70 text-ink-soft hover:border-sage-300"
              }`}
            >
              <input
                type="radio"
                name="vase"
                value={vase.id}
                checked={selected}
                onChange={() => onChange(vase.id)}
                className="sr-only"
              />
              <svg viewBox="80 280 240 210" className="h-12 w-14" aria-hidden="true">
                <VaseFront style={vase.id} withDefs={false} />
              </svg>
              {vase.name}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
