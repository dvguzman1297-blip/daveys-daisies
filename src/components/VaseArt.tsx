import type { VaseStyle } from "@/types/bouquet";

/** Back layer: drawn behind the stems (only wraps have a visible back flap). */
export function VaseBack({ style }: { style: VaseStyle }) {
  if (style === "kraft") {
    return <path d="M96 318 L200 286 L304 318 L250 360 L150 360 Z" fill="#c99a68" />;
  }
  if (style === "ribbon") {
    return <path d="M100 318 L200 288 L300 318 L250 360 L150 360 Z" fill="#f3bfc8" />;
  }
  return null;
}

/** Front layer: drawn over the stems. */
export function VaseFront({ style }: { style: VaseStyle }) {
  if (style === "glass") {
    return (
      <g>
        <path
          d="M142 336 L258 336 L246 470 Q200 486 154 470 Z"
          fill="#dff0f2"
          fillOpacity={0.45}
          stroke="#a9cdd2"
          strokeWidth={2.5}
        />
        <path d="M145 372 L255 372 L246 470 Q200 486 154 470 Z" fill="#bfe3e8" fillOpacity={0.45} />
        <ellipse cx={200} cy={336} rx={58} ry={7} fill="none" stroke="#a9cdd2" strokeWidth={2.5} />
        <path d="M162 350 L168 452" stroke="#ffffff" strokeOpacity={0.7} strokeWidth={5} strokeLinecap="round" />
      </g>
    );
  }

  const paper = style === "kraft" ? "#d9b082" : "#f9dde2";
  const shade = style === "kraft" ? "#c4955f" : "#f3bfc8";
  const tie = style === "kraft" ? "#8aa682" : "#e48a9b";

  return (
    <g>
      <path d="M88 322 L180 482 L220 482 L312 322 L262 344 L200 330 L138 344 Z" fill={paper} />
      <path d="M88 322 L180 482 L200 482 L150 346 Z" fill={shade} opacity={0.7} />
      <path d="M312 322 L220 482 L232 482 L262 344 Z" fill={shade} opacity={0.5} />
      {/* Bow */}
      <g transform="translate(200 410)">
        <path d="M0 0 C -30 -26, -46 -4, -36 10 C -26 20, -10 8, 0 0 Z" fill={tie} />
        <path d="M0 0 C 30 -26, 46 -4, 36 10 C 26 20, 10 8, 0 0 Z" fill={tie} />
        <path d="M-2 2 L -16 44 L -6 40 L 0 6 Z" fill={tie} />
        <path d="M2 2 L 16 44 L 6 40 L 0 6 Z" fill={tie} />
        <circle r={7} fill={tie} stroke="#ffffff" strokeOpacity={0.4} strokeWidth={2} />
      </g>
    </g>
  );
}
