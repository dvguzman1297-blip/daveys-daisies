import type { VaseStyle } from "@/types/bouquet";

/*
 * Every vessel/wrap is drawn in the 400×500 canvas space. Stems pass through
 * an opening centred at (200, 336), so each style keeps its mouth around there.
 */

interface WrapColors {
  paper: string;
  shade: string;
  back: string;
  tie: string;
}

const WRAPS: Partial<Record<VaseStyle, WrapColors>> = {
  ribbon: { paper: "#f9dde2", shade: "#f3bfc8", back: "#f3bfc8", tie: "#e48a9b" },
  kraft: { paper: "#d9b082", shade: "#c4955f", back: "#c99a68", tie: "#8aa682" },
  newspaper: { paper: "#efeadf", shade: "#dcd4c3", back: "#e2dccd", tie: "#b08a5a" },
  tissue: { paper: "#ebe1f7", shade: "#d6c8ee", back: "#ffffff", tie: "#9b86c9" },
};

/** Back layer: drawn behind the stems (wrap back flaps, basket handle, vessel interiors). */
export function VaseBack({ style }: { style: VaseStyle }) {
  const wrap = WRAPS[style];
  if (wrap) {
    return (
      <g>
        <path d="M96 318 L200 286 L304 318 L250 360 L150 360 Z" fill={wrap.back} />
        {style === "tissue" && (
          // Second tissue layer peeking out with a soft scalloped edge.
          <path
            d="M84 326 Q 104 300 126 312 Q 146 284 170 300 Q 200 272 230 300 Q 254 284 274 312 Q 296 300 316 326 L250 362 L150 362 Z"
            fill="#d6c8ee"
          />
        )}
      </g>
    );
  }
  if (style === "basket") {
    return (
      <path
        d="M128 342 C 120 170, 280 170, 272 342"
        fill="none"
        stroke="#b7864f"
        strokeWidth={11}
        strokeLinecap="round"
      />
    );
  }
  if (style === "pitcher") {
    return <ellipse cx={200} cy={336} rx={50} ry={9} fill="#5f7a58" />;
  }
  return null;
}

/** Front layer: drawn over the stems. */
export function VaseFront({ style }: { style: VaseStyle }) {
  const wrap = WRAPS[style];
  if (wrap) return <Wrap style={style} colors={wrap} />;
  if (style === "mason") return <MasonJar />;
  if (style === "pitcher") return <Pitcher />;
  if (style === "basket") return <Basket />;
  return <GlassVase />;
}

function GlassVase() {
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

function Wrap({ style, colors }: { style: VaseStyle; colors: WrapColors }) {
  const { paper, shade, tie } = colors;
  return (
    <g>
      <path d="M88 322 L180 482 L220 482 L312 322 L262 344 L200 330 L138 344 Z" fill={paper} />
      <path d="M88 322 L180 482 L200 482 L150 346 Z" fill={shade} opacity={0.7} />
      <path d="M312 322 L220 482 L232 482 L262 344 Z" fill={shade} opacity={0.5} />

      {style === "newspaper" && (
        // Faux newsprint: a headline bar and columns of text lines.
        <g fill="#8c8478" fillOpacity={0.45}>
          <rect x={168} y={350} width={74} height={7} rx={2} />
          {[366, 374, 382, 440, 448, 456].map((y) => (
            <g key={y}>
              <rect x={166 + (y - 366) * 0.14} y={y} width={34 - (y - 366) * 0.12} height={3} rx={1.5} />
              <rect x={206} y={y} width={36 - (y - 366) * 0.18} height={3} rx={1.5} />
            </g>
          ))}
        </g>
      )}

      {style === "newspaper" ? <Twine color={tie} /> : <Bow color={tie} />}
    </g>
  );
}

function Bow({ color }: { color: string }) {
  return (
    <g transform="translate(200 410)">
      <path d="M0 0 C -30 -26, -46 -4, -36 10 C -26 20, -10 8, 0 0 Z" fill={color} />
      <path d="M0 0 C 30 -26, 46 -4, 36 10 C 26 20, 10 8, 0 0 Z" fill={color} />
      <path d="M-2 2 L -16 44 L -6 40 L 0 6 Z" fill={color} />
      <path d="M2 2 L 16 44 L 6 40 L 0 6 Z" fill={color} />
      <circle r={7} fill={color} stroke="#ffffff" strokeOpacity={0.4} strokeWidth={2} />
    </g>
  );
}

function Twine({ color }: { color: string }) {
  return (
    <g stroke={color} strokeWidth={3} fill="none" strokeLinecap="round">
      <path d="M150 404 Q 200 414 250 404" />
      <path d="M152 412 Q 200 422 248 412" />
      <path d="M200 412 C 184 396, 176 410, 192 414" />
      <path d="M200 412 C 216 396, 224 410, 208 414" />
      <path d="M198 414 L 190 436" />
      <path d="M202 414 L 212 434" />
    </g>
  );
}

function MasonJar() {
  return (
    <g>
      <path
        d="M146 348 L254 348 L254 468 Q254 482 240 482 L160 482 Q146 482 146 468 Z"
        fill="#e3f1f2"
        fillOpacity={0.45}
        stroke="#a9cdd2"
        strokeWidth={2.5}
      />
      <path d="M148 384 L252 384 L252 468 Q252 480 240 480 L160 480 Q148 480 148 468 Z" fill="#bfe3e8" fillOpacity={0.45} />
      {/* Threaded neck */}
      <rect x={152} y={326} width={96} height={22} rx={4} fill="#e3f1f2" fillOpacity={0.5} stroke="#a9cdd2" strokeWidth={2.5} />
      <path d="M154 333 L246 336 M154 340 L246 343" stroke="#a9cdd2" strokeWidth={1.5} />
      {/* Twine with a small bow */}
      <rect x={148} y={348} width={104} height={7} rx={3} fill="#b08a5a" />
      <path d="M232 352 C 222 338, 214 352, 230 356 M232 352 C 244 338, 250 352, 234 356" stroke="#b08a5a" strokeWidth={3} fill="none" />
      <path d="M231 356 L 226 374 M234 356 L 240 372" stroke="#b08a5a" strokeWidth={3} strokeLinecap="round" />
      {/* Embossed label + highlight */}
      <rect x={176} y={400} width={48} height={30} rx={6} fill="#ffffff" fillOpacity={0.35} />
      <path d="M160 364 L160 462" stroke="#ffffff" strokeOpacity={0.7} strokeWidth={5} strokeLinecap="round" />
    </g>
  );
}

function Pitcher() {
  return (
    <g>
      {/* Handle */}
      <path d="M246 352 C 292 352, 300 420, 252 440" fill="none" stroke="#8fae86" strokeWidth={12} strokeLinecap="round" />
      {/* Body */}
      <path d="M150 336 C 126 384, 124 446, 160 480 L240 480 C 276 446, 274 384, 250 336 Z" fill="#a9c3a0" />
      <path d="M150 336 C 126 384, 124 446, 160 480 L178 480 C 150 446, 150 384, 166 338 Z" fill="#94b08b" />
      {/* Spout and rim */}
      <path d="M152 334 L 126 324 L 150 350 Z" fill="#a9c3a0" />
      <path d="M150 336 Q 200 348 250 336" fill="none" stroke="#c3d6bc" strokeWidth={5} strokeLinecap="round" />
      {/* Painted daisies */}
      {[
        [196, 412],
        [228, 444],
        [180, 456],
      ].map(([x, y]) => (
        <g key={`${x}-${y}`} transform={`translate(${x} ${y})`} fill="#ffffff" fillOpacity={0.85}>
          {[0, 60, 120, 180, 240, 300].map((r) => (
            <ellipse key={r} cx={0} cy={-6} rx={3} ry={5.5} transform={`rotate(${r})`} />
          ))}
          <circle r={3} fill="#efc24a" fillOpacity={1} />
        </g>
      ))}
      <path d="M232 360 C 244 386, 246 420, 238 448" stroke="#ffffff" strokeOpacity={0.35} strokeWidth={6} fill="none" strokeLinecap="round" />
    </g>
  );
}

function Basket() {
  return (
    <g>
      <path d="M120 344 L280 344 L262 470 Q200 484 138 470 Z" fill="#c99a62" />
      {/* Weave: horizontal bands and vertical stakes */}
      <g stroke="#a97c45" strokeWidth={3} fill="none">
        {[372, 398, 424, 450].map((y) => (
          <path key={y} d={`M${124 + (y - 344) * 0.14} ${y} Q 200 ${y + 6} ${276 - (y - 344) * 0.14} ${y}`} />
        ))}
      </g>
      <g stroke="#b88a52" strokeWidth={2} strokeDasharray="8 6">
        {[150, 175, 200, 225, 250].map((x) => (
          <path key={x} d={`M${x} 350 L${200 + (x - 200) * 0.8} 474`} />
        ))}
      </g>
      {/* Rim */}
      <rect x={114} y={332} width={172} height={16} rx={8} fill="#b7864f" />
      <path d="M122 340 L278 340" stroke="#d4a874" strokeWidth={3} strokeDasharray="10 6" strokeLinecap="round" />
    </g>
  );
}
