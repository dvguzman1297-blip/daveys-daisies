import type { Leaf } from "@/lib/arrangement";

const LEAF_FILL = ["#7f9f73", "#668a5d"] as const;
const EUCALYPTUS_FILL = ["#a9c1b5", "#93ae9f"] as const;

/** Greenery drawn from its base at the origin, pointing up (-y). */
export function FoliageArt({ kind, shade }: Pick<Leaf, "kind" | "shade">) {
  if (kind === "eucalyptus") {
    const fill = EUCALYPTUS_FILL[shade];
    return (
      <g>
        <path d="M0 0 C 2 -18, -2 -34, 1 -52" stroke="#7d9a8c" strokeWidth={2} fill="none" strokeLinecap="round" />
        <circle cx={-7} cy={-12} r={7} fill={fill} />
        <circle cx={8} cy={-22} r={7.5} fill={fill} />
        <circle cx={-7} cy={-33} r={6.5} fill={fill} />
        <circle cx={7} cy={-42} r={5.5} fill={fill} />
        <circle cx={1} cy={-53} r={4.5} fill={fill} />
      </g>
    );
  }
  return (
    <g>
      <path d="M0 0 C 13 -12, 13 -36, 0 -50 C -13 -36, -13 -12, 0 0 Z" fill={LEAF_FILL[shade]} />
      <path d="M0 -3 C 1 -18, 1 -32, 0 -46" stroke="#ffffff" strokeOpacity={0.25} strokeWidth={1.5} fill="none" />
    </g>
  );
}
