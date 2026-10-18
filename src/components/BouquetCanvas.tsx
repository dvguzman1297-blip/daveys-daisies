"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState, type DragEvent } from "react";
import { CANVAS, arrangeBouquet, arrangeFoliage, foliageStemPath, stemPath } from "@/lib/arrangement";
import { getFlower, isFlowerId } from "@/lib/catalog";
import type { BouquetFlower, FlowerId, VaseStyle } from "@/types/bouquet";
import { FlowerDefs, FlowerHead } from "./flowers/FlowerArt";
import { FoliageArt } from "./flowers/FoliageArt";
import { VaseBack, VaseFront } from "./VaseArt";

export const FLOWER_DRAG_TYPE = "application/x-flower-id";

const headSpring = { type: "spring", stiffness: 260, damping: 18, mass: 0.8 } as const;

interface BouquetCanvasProps {
  flowers: BouquetFlower[];
  vase: VaseStyle;
  /** "edit": drop target + tap a flower to remove it. "view": bloom-in + hover play. */
  mode?: "edit" | "view";
  onAddFlower?: (id: FlowerId) => void;
  onRemoveFlower?: (id: FlowerId) => void;
  className?: string;
  /** Seconds to wait before the bloom sequence starts in view mode. */
  bloomDelay?: number;
}

export function BouquetCanvas({
  flowers,
  vase,
  mode = "view",
  onAddFlower,
  onRemoveFlower,
  className = "",
  bloomDelay = 0,
}: BouquetCanvasProps) {
  const stems = useMemo(() => arrangeBouquet(flowers), [flowers]);
  const heads = useMemo(
    () => stems.map((s, i) => ({ ...s, order: i })).sort((a, b) => a.depth - b.depth),
    [stems],
  );
  const foliage = useMemo(() => arrangeFoliage(stems.length), [stems.length]);
  const [dragOver, setDragOver] = useState(false);
  const editable = mode === "edit";

  // Keep the whole bloom sequence under ~1.6s, even for big bouquets.
  const stagger = Math.min(0.12, 1.6 / Math.max(stems.length, 1));
  const delayFor = (i: number) => (editable ? 0 : bloomDelay + i * stagger);

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const id = e.dataTransfer.getData(FLOWER_DRAG_TYPE);
    if (isFlowerId(id)) onAddFlower?.(id);
  };

  return (
    <div
      className={`relative ${className}`}
      onDragOver={
        editable
          ? (e) => {
              if (e.dataTransfer.types.includes(FLOWER_DRAG_TYPE)) {
                e.preventDefault();
                e.dataTransfer.dropEffect = "copy";
                setDragOver(true);
              }
            }
          : undefined
      }
      onDragLeave={editable ? () => setDragOver(false) : undefined}
      onDrop={editable ? handleDrop : undefined}
    >
      <svg
        viewBox={`0 0 ${CANVAS.width} ${CANVAS.height}`}
        className="h-full w-full overflow-visible"
        role="img"
        aria-label={describe(flowers, vase)}
      >
        <FlowerDefs />
        <VaseBack style={vase} />

        {/* Foliage sprigs (behind the flower stems) */}
        <AnimatePresence>
          {foliage.map((leaf, k) => {
            const d = foliageStemPath(leaf);
            return (
              <motion.path
                key={`sprig-${leaf.key}`}
                d={d}
                stroke="#7d9a6f"
                strokeWidth={2.5}
                strokeLinecap="round"
                fill="none"
                initial={{ opacity: 0 }}
                animate={{ d, opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
                transition={{
                  d: headSpring,
                  opacity: { duration: 0.4, delay: editable ? 0 : bloomDelay + 0.2 + k * 0.02 },
                }}
              />
            );
          })}
        </AnimatePresence>

        {/* Stems */}
        <AnimatePresence>
          {stems.map((s, i) => {
            const d = stemPath(s);
            return (
              <motion.path
                key={`stem-${s.key}`}
                d={d}
                stroke={s.flowerId === "lavender" ? "#7f9a6f" : "#6f9466"}
                strokeWidth={4}
                strokeLinecap="round"
                fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ d, pathLength: 1, opacity: 1 }}
                exit={{ pathLength: 0, opacity: 0, transition: { duration: 0.2 } }}
                transition={{
                  d: headSpring,
                  pathLength: { duration: 0.5, delay: delayFor(i), ease: "easeOut" },
                  opacity: { duration: 0.2, delay: delayFor(i) },
                }}
              />
            );
          })}
        </AnimatePresence>

        {/* Greenery framing and filling the dome */}
        <AnimatePresence>
          {foliage.map((leaf, k) => (
            <motion.g
              key={leaf.key}
              initial={{ x: leaf.x, y: leaf.y + 12, opacity: 0 }}
              animate={{ x: leaf.x, y: leaf.y, opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
              transition={{
                x: headSpring,
                y: { ...headSpring, delay: editable ? 0 : bloomDelay + 0.2 + k * 0.02 },
                opacity: { duration: 0.4, delay: editable ? 0 : bloomDelay + 0.2 + k * 0.02 },
              }}
            >
              {/* Rotation/scale as SVG attributes so they pivot on the leaf's base, not its centre */}
              <g transform={`rotate(${leaf.rotation}) scale(${leaf.scale})`}>
                <FoliageArt kind={leaf.kind} shade={leaf.shade} />
              </g>
            </motion.g>
          ))}
        </AnimatePresence>

        {/* Flower heads */}
        <AnimatePresence>
          {heads.map((s) => {
            const name = getFlower(s.flowerId).name;
            return (
              <motion.g
                key={`head-${s.key}`}
                initial={{ x: s.headX, y: s.headY, scale: 0, rotate: s.rotation - 40, opacity: 0 }}
                animate={{ x: s.headX, y: s.headY, scale: s.scale, rotate: s.rotation, opacity: 1 }}
                exit={{ scale: 0, opacity: 0, transition: { duration: 0.2 } }}
                transition={{ ...headSpring, delay: delayFor(s.order) + (editable ? 0 : 0.35) }}
              >
                <motion.g
                  whileHover={{ scale: 1.14, rotate: [0, -7, 7, 0] }}
                  whileTap={{ scale: 0.92 }}
                  transition={{ duration: 0.45 }}
                  className={editable ? "cursor-pointer outline-none" : "cursor-default"}
                  {...(editable && onRemoveFlower
                    ? {
                        role: "button",
                        tabIndex: 0,
                        "aria-label": `Remove one ${name}`,
                        onClick: () => onRemoveFlower(s.flowerId),
                        onKeyDown: (e: React.KeyboardEvent) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            onRemoveFlower(s.flowerId);
                          }
                        },
                      }
                    : {})}
                >
                  <title>{editable ? `${name} — tap to remove` : name}</title>
                  {/* Invisible hit area so hover/tap is forgiving */}
                  <circle r={34} fill="transparent" />
                  <FlowerHead id={s.flowerId} />
                </motion.g>
              </motion.g>
            );
          })}
        </AnimatePresence>

        <VaseFront style={vase} />
      </svg>

      {editable && stems.length === 0 && (
        <p className="pointer-events-none absolute inset-x-0 top-[28%] mx-auto max-w-[16rem] text-center font-display text-lg text-ink-soft">
          Tap or drag a flower here to start your bouquet
        </p>
      )}

      {editable && dragOver && (
        <div className="pointer-events-none absolute inset-2 rounded-3xl border-2 border-dashed border-sage-500 bg-sage-100/40" />
      )}
    </div>
  );
}

function describe(flowers: BouquetFlower[], vase: VaseStyle) {
  if (flowers.length === 0) return "An empty vase";
  const parts = flowers.map((f) => `${f.name} × ${f.count}`);
  const holder = vase === "glass" ? "a glass vase" : vase === "ribbon" ? "a ribbon wrap" : "kraft paper";
  return `A bouquet of ${parts.join(", ")} in ${holder}`;
}
