import type { BouquetFlower, FlowerId } from "@/types/bouquet";

/** Canvas coordinate system (SVG viewBox units). */
export const CANVAS = { width: 400, height: 500, stemBaseX: 200, stemBaseY: 410 };

export interface Stem {
  /** Stable key so existing stems glide to new positions instead of remounting. */
  key: string;
  flowerId: FlowerId;
  headX: number;
  headY: number;
  baseX: number;
  rotation: number;
  /** Head scale: bouquet-size scale × per-flower size. */
  scale: number;
  /** Sort order: lower renders first (further back). */
  depth: number;
}

export interface Leaf {
  key: string;
  kind: "leaf" | "eucalyptus";
  x: number;
  y: number;
  rotation: number;
  scale: number;
  shade: 0 | 1;
}

/** Small deterministic pseudo-random jitter in [-1, 1]. */
const jitter = (seed: number) => {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return (x - Math.floor(x)) * 2 - 1;
};

/** Round so server (Node) and browser floating-point output match during hydration. */
const round = (n: number) => Math.round(n * 100) / 100;

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

/** Where stems start (inside the vase) and the opening they all pass through. */
const STEM_BOTTOM_Y = CANVAS.stemBaseY + 50;
const MOUTH_Y = 336;
const MOUTH_HALF_WIDTH = 46;
/** Lowest point of the flower dome — just above the vase/wrap opening. */
const DOME_BOTTOM_Y = 318;

/** Relative head size per flower, so a sunflower reads bigger than a daisy. */
const FLOWER_SIZE: Record<FlowerId, number> = {
  sunflower: 1.15,
  rose: 0.98,
  tulip: 0.92,
  daisy: 0.9,
  "babys-breath": 1.2,
  lavender: 1,
  chrysanthemum: 1,
  marigold: 0.95,
  dahlia: 1.05,
  wheat: 1,
  peony: 1.1,
  poppy: 1,
  hydrangea: 1.15,
  aster: 0.85,
};

/** The dome is an ellipse whose size grows with the number of flowers. */
function domeFor(n: number) {
  const rx = 55 + 21 * Math.sqrt(Math.max(n, 1));
  const ry = rx * 0.72;
  return { cx: CANVAS.stemBaseX, cy: DOME_BOTTOM_Y - ry, rx, ry };
}

/**
 * Expands flower counts into individual stems, interleaving types round-robin
 * so the bouquet looks mixed, then packs the heads into a dome above the vase
 * using a golden-angle (sunflower-seed) spiral: dense, organic and never
 * mirror-symmetric. Positions are derived purely from the counts, so the
 * database only needs `{ id, count }` and every viewer sees the same bouquet.
 */
export function arrangeBouquet(flowers: BouquetFlower[]): Stem[] {
  const queue = flowers.map((f) => ({ id: f.id, left: f.count, used: 0 }));
  const order: { flowerId: FlowerId; key: string }[] = [];
  while (queue.some((q) => q.left > 0)) {
    for (const q of queue) {
      if (q.left > 0) {
        order.push({ flowerId: q.id, key: `${q.id}-${q.used}` });
        q.left -= 1;
        q.used += 1;
      }
    }
  }

  const n = order.length;
  const { cx, cy, rx, ry } = domeFor(n);
  const sizeScale = n <= 8 ? 1 : Math.max(0.8, 1 - (n - 8) * 0.017);

  return order.map((item, i) => {
    const seed = i + 1;
    const r = n === 1 ? 0 : Math.sqrt((i + 0.5) / n);
    const theta = i * GOLDEN_ANGLE + 0.6;
    const headX = cx + r * rx * Math.cos(theta) + jitter(seed) * 7;
    const headY = cy + r * ry * Math.sin(theta) + jitter(seed * 5) * 6;

    // Tilt each head along the direction its stem leaves the vase.
    const lean = (Math.atan2(headX - CANVAS.stemBaseX, MOUTH_Y - headY) * 180) / Math.PI;

    return {
      key: item.key,
      flowerId: item.flowerId,
      headX: round(headX),
      headY: round(headY),
      baseX: round(CANVAS.stemBaseX + Math.max(-15, Math.min(15, (headX - CANVAS.stemBaseX) * 0.12))),
      rotation: round(lean * 0.55 + jitter(seed * 3) * 10),
      scale: round(sizeScale * FLOWER_SIZE[item.flowerId]),
      // Lower heads sit in front, like looking at the bouquet slightly from above.
      depth: round(headY),
    };
  });
}

/**
 * Greenery that frames the flowers: leaves and eucalyptus fanning out around
 * the dome's edge, plus a few tucked between heads to fill the gaps.
 */
export function arrangeFoliage(flowerCount: number): Leaf[] {
  if (flowerCount === 0) return [];
  const { cx, cy, rx, ry } = domeFor(flowerCount);
  const leaves: Leaf[] = [];

  // Outer ring: from lower-left, over the top, to lower-right (SVG y points down).
  const ring = 6 + Math.round(flowerCount * 0.7);
  for (let k = 0; k < ring; k++) {
    const seed = 100 + k;
    const t = ring === 1 ? 0.5 : k / (ring - 1);
    const phi = Math.PI * (-1.1 + t * 1.2) + jitter(seed) * 0.12;
    const reach = 0.72 + jitter(seed * 3) * 0.08;
    leaves.push({
      key: `ring-${k}`,
      kind: k % 3 === 1 ? "eucalyptus" : "leaf",
      x: round(cx + Math.cos(phi) * rx * reach),
      y: round(cy + Math.sin(phi) * ry * reach),
      rotation: round((phi * 180) / Math.PI + 90 + jitter(seed * 7) * 12),
      scale: round(0.9 + jitter(seed * 11) * 0.15),
      shade: (k % 2) as 0 | 1,
    });
  }

  // Filler between heads (mostly hidden; peeks of green fill the gaps).
  const filler = Math.round(flowerCount / 3);
  for (let k = 0; k < filler; k++) {
    const seed = 300 + k;
    const r = Math.sqrt((k + 0.5) / Math.max(filler, 1)) * 0.8;
    const theta = (k + 0.5) * GOLDEN_ANGLE + 2.1;
    leaves.push({
      key: `fill-${k}`,
      kind: k % 2 ? "eucalyptus" : "leaf",
      x: round(cx + r * rx * Math.cos(theta)),
      y: round(cy + r * ry * Math.sin(theta)),
      rotation: round((theta * 180) / Math.PI + jitter(seed) * 20),
      scale: 0.75,
      shade: ((k + 1) % 2) as 0 | 1,
    });
  }

  return leaves;
}

/**
 * SVG path for a stem: a straight run from the bottom of the vase up through
 * its opening, then a gentle curve out to the flower head. Routing every stem
 * through the opening keeps wide stems from cutting through the glass walls.
 * Every stem uses the same M/L/Q structure so Framer Motion can morph `d`.
 */
export function stemPath(s: Pick<Stem, "baseX" | "headX" | "headY">) {
  const { stemBaseX } = CANVAS;
  // baseX spreads ±15 around the centre; widen that to fan across the opening.
  const mouthX = round(
    stemBaseX + Math.max(-MOUTH_HALF_WIDTH, Math.min(MOUTH_HALF_WIDTH, (s.baseX - stemBaseX) * 3)),
  );
  const ctrlX = round(mouthX + (s.headX - mouthX) * 0.2);
  const ctrlY = round(MOUTH_Y - (MOUTH_Y - s.headY) * 0.5);
  return `M ${s.baseX} ${STEM_BOTTOM_Y} L ${mouthX} ${MOUTH_Y} Q ${ctrlX} ${ctrlY} ${s.headX} ${s.headY}`;
}

/** Foliage sprigs grow from the vase too, so leaves never float in mid-air. */
export function foliageStemPath(leaf: Pick<Leaf, "x" | "y">) {
  const baseX = round(CANVAS.stemBaseX + Math.max(-15, Math.min(15, (leaf.x - CANVAS.stemBaseX) * 0.12)));
  return stemPath({ baseX, headX: leaf.x, headY: leaf.y });
}

export const totalFlowers = (flowers: BouquetFlower[]) =>
  flowers.reduce((sum, f) => sum + f.count, 0);
