import { FlowerDefs } from "./flowers/FlowerArt";
import { VaseDefs } from "./VaseArt";

/**
 * The gradients and filters every flower and vase drawing refers to, mounted
 * once for the whole document by the root layout.
 *
 * They must exist exactly once. With duplicate ids Safari resolves a gradient to
 * one copy and keeps pointing at it after that copy is removed from the page
 * (for example when the builder moves to the next step), and the flowers lose
 * their fill. Not display:none either, which stops gradients rendering at all.
 */
export function SvgDefs() {
  return (
    <svg width={0} height={0} aria-hidden="true" focusable="false" style={{ position: "absolute" }}>
      <FlowerDefs />
      <VaseDefs />
    </svg>
  );
}
