import { arrangeBouquet, arrangeFoliage, foliageStemPath, stemPath } from "@/lib/arrangement";
import type { BouquetFlower, VaseStyle } from "@/types/bouquet";
import { FlowerDefs, FlowerHead } from "./flowers/FlowerArt";
import { FoliageArt } from "./flowers/FoliageArt";
import { VaseBack, VaseFront } from "./VaseArt";

/**
 * The bouquet drawn once, with no animation or interactivity, so it can be
 * serialized to a standalone SVG for the downloadable keepsake. Mirrors the
 * layering in BouquetCanvas.
 */
export function StaticBouquet({ flowers, vase }: { flowers: BouquetFlower[]; vase: VaseStyle }) {
  const stems = arrangeBouquet(flowers);
  const heads = stems.map((s, i) => ({ ...s, order: i })).sort((a, b) => a.depth - b.depth);
  const foliage = arrangeFoliage(stems.length);

  return (
    <>
      <FlowerDefs />
      <VaseBack style={vase} />
      {foliage.map((leaf) => (
        <path
          key={`sprig-${leaf.key}`}
          d={foliageStemPath(leaf)}
          stroke="#7d9a6f"
          strokeWidth={2.5}
          strokeLinecap="round"
          fill="none"
        />
      ))}
      {stems.map((s) => (
        <path
          key={`stem-${s.key}`}
          d={stemPath(s)}
          stroke={s.flowerId === "lavender" ? "#7f9a6f" : "#6f9466"}
          strokeWidth={4}
          strokeLinecap="round"
          fill="none"
        />
      ))}
      {foliage.map((leaf) => (
        <g key={leaf.key} transform={`translate(${leaf.x} ${leaf.y})`}>
          <g transform={`rotate(${leaf.rotation}) scale(${leaf.scale})`}>
            <FoliageArt kind={leaf.kind} shade={leaf.shade} />
          </g>
        </g>
      ))}
      {heads.map((s) => (
        <g key={`head-${s.key}`} transform={`translate(${s.headX} ${s.headY}) rotate(${s.rotation}) scale(${s.scale})`}>
          <FlowerHead id={s.flowerId} />
        </g>
      ))}
      <VaseFront style={vase} />
    </>
  );
}
