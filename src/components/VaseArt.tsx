import type { VaseStyle } from "@/types/bouquet";

/*
 * Every vessel/wrap is drawn in the 400×500 canvas space. Stems pass through
 * an opening centred at (200, 336), so each style keeps its mouth around there.
 *
 * Realism comes from layering: a contact shadow on the ground, a back layer
 * (inside of the wrap, rear rim) behind the stems, and a front layer with
 * gradient shading, creases, highlights and texture in front of them.
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

const WRAP_OUTLINE = "M88 322 L180 482 L220 482 L312 322 L262 344 L200 330 L138 344 Z";

/** Gradients, filters and clips shared by every vessel. Rendered by both layers. */
export function VaseDefs() {
  return (
    <defs>
      <radialGradient id="vase-ground">
        <stop offset="0%" stopColor="#2a2218" stopOpacity={0.34} />
        <stop offset="100%" stopColor="#2a2218" stopOpacity={0} />
      </radialGradient>

      {/* Left-to-right cylinder shading: dark edges, bright middle. */}
      <linearGradient id="vase-round" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#000" stopOpacity={0.24} />
        <stop offset="25%" stopColor="#000" stopOpacity={0} />
        <stop offset="50%" stopColor="#fff" stopOpacity={0.2} />
        <stop offset="75%" stopColor="#000" stopOpacity={0} />
        <stop offset="100%" stopColor="#000" stopOpacity={0.26} />
      </linearGradient>
      {/* Top-to-bottom darkening, for the inside of a wrap or the foot of a vessel. */}
      <linearGradient id="vase-inner" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#000" stopOpacity={0} />
        <stop offset="100%" stopColor="#000" stopOpacity={0.28} />
      </linearGradient>

      <linearGradient id="vase-glass" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#8fc0c9" stopOpacity={0.6} />
        <stop offset="18%" stopColor="#d8eef1" stopOpacity={0.35} />
        <stop offset="50%" stopColor="#eef9fa" stopOpacity={0.12} />
        <stop offset="82%" stopColor="#cde8ec" stopOpacity={0.3} />
        <stop offset="100%" stopColor="#86b8c2" stopOpacity={0.6} />
      </linearGradient>
      <linearGradient id="vase-water" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#9dd0d9" stopOpacity={0.5} />
        <stop offset="100%" stopColor="#5f9fad" stopOpacity={0.72} />
      </linearGradient>

      <linearGradient id="vase-ceramic" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#5f7e59" />
        <stop offset="20%" stopColor="#8fae86" />
        <stop offset="45%" stopColor="#bcd4b3" />
        <stop offset="75%" stopColor="#93b08a" />
        <stop offset="100%" stopColor="#566f50" />
      </linearGradient>

      {/* Paper fibre: faint speckle composited over the sheet. */}
      <filter id="vase-grain" colorInterpolationFilters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency={0.55} numOctaves={2} seed={4} result="noise" />
        <feColorMatrix
          in="noise"
          type="matrix"
          values="0 0 0 0 0.32  0 0 0 0 0.22  0 0 0 0 0.12  0 0 0 0.45 -0.13"
          result="speckle"
        />
        <feComposite in="speckle" in2="SourceGraphic" operator="in" result="grain" />
        <feMerge>
          <feMergeNode in="SourceGraphic" />
          <feMergeNode in="grain" />
        </feMerge>
      </filter>

      <clipPath id="vase-wrap-clip">
        <path d={WRAP_OUTLINE} />
      </clipPath>
      <clipPath id="vase-basket-clip">
        <path d="M120 344 L280 344 L262 470 Q200 486 138 470 Z" />
      </clipPath>
    </defs>
  );
}

/** Back layer: drawn behind the stems (wrap back flaps, basket handle, vessel interiors). */
export function VaseBack({ style }: { style: VaseStyle }) {
  const wrap = WRAPS[style];
  const shadowRx = wrap ? 46 : style === "basket" ? 86 : style === "pitcher" ? 84 : 76;
  const shadow = <ellipse cx={200} cy={484} rx={shadowRx} ry={8} fill="url(#vase-ground)" />;

  if (wrap) {
    return (
      <g>
        <VaseDefs />
        {shadow}
        <path d="M96 318 L200 286 L304 318 L250 360 L150 360 Z" fill={wrap.back} filter={style === "tissue" ? undefined : "url(#vase-grain)"} />
        {style === "tissue" && (
          // Second tissue layer peeking out with a soft scalloped edge.
          <>
            <path
              d="M84 326 Q 104 300 126 312 Q 146 284 170 300 Q 200 272 230 300 Q 254 284 274 312 Q 296 300 316 326 L250 362 L150 362 Z"
              fill="#d6c8ee"
            />
            <path d="M92 322 Q 108 304 126 313 M274 313 Q 294 304 308 322" fill="none" stroke="#ffffff" strokeOpacity={0.6} strokeWidth={1.4} />
          </>
        )}
        {/* the inside of the wrap falls into shadow */}
        <path d="M96 318 L200 286 L304 318 L250 360 L150 360 Z" fill="url(#vase-inner)" />
        <path d="M150 318 L168 358 M200 296 L200 358 M250 318 L232 358" stroke="#000" strokeOpacity={0.09} strokeWidth={1.2} fill="none" />
        <path d="M96 318 L200 286 L304 318" fill="none" stroke="#ffffff" strokeOpacity={0.55} strokeWidth={1.6} strokeLinejoin="round" />
      </g>
    );
  }
  if (style === "basket") {
    const handle = "M128 342 C 120 170, 280 170, 272 342";
    return (
      <g>
        <VaseDefs />
        {shadow}
        <path d={handle} fill="none" stroke="#8f6330" strokeWidth={15} strokeLinecap="round" />
        <path d={handle} fill="none" stroke="#b7864f" strokeWidth={11} strokeLinecap="round" />
        <path d={handle} fill="none" stroke="#dbb27a" strokeWidth={6} strokeDasharray="3 5" strokeLinecap="round" opacity={0.85} />
        <path d={handle} fill="none" stroke="#fff" strokeWidth={1.5} strokeOpacity={0.25} transform="translate(-2 -1)" />
      </g>
    );
  }
  if (style === "pitcher") {
    return (
      <g>
        <VaseDefs />
        {shadow}
        <ellipse cx={200} cy={336} rx={50} ry={9} fill="#4a6445" />
        <ellipse cx={200} cy={338} rx={44} ry={6} fill="#2f4a2b" opacity={0.55} />
      </g>
    );
  }
  // Glass vase and mason jar: the far half of the rim, seen through the glass.
  const jar = style === "mason";
  return (
    <g>
      <VaseDefs />
      {shadow}
      {jar ? (
        <>
          <ellipse cx={200} cy={326} rx={47} ry={5} fill="#bcd9de" fillOpacity={0.45} />
          <path d="M153 326 A 47 5 0 0 1 247 326" fill="none" stroke="#a9cdd2" strokeWidth={2.5} />
        </>
      ) : (
        <>
          <ellipse cx={200} cy={336} rx={59} ry={7.5} fill="#bcd9de" fillOpacity={0.4} />
          <path d="M140 336 A 60 8 0 0 1 260 336" fill="none" stroke="#a9d0d6" strokeWidth={2.5} strokeOpacity={0.9} />
        </>
      )}
    </g>
  );
}

/**
 * Front layer: drawn over the stems. Carries its own gradients and filters
 * unless `withDefs` is false, for a page that renders one <VaseDefs /> shared by
 * several vessels (the picker).
 */
export function VaseFront({ style, withDefs = true }: { style: VaseStyle; withDefs?: boolean }) {
  const wrap = WRAPS[style];
  let art;
  if (wrap) art = <Wrap style={style} colors={wrap} />;
  else if (style === "mason") art = <MasonJar />;
  else if (style === "pitcher") art = <Pitcher />;
  else if (style === "basket") art = <Basket />;
  else art = <GlassVase />;
  return (
    <g>
      {withDefs && <VaseDefs />}
      {art}
    </g>
  );
}

const GLASS_BODY = "M140 336 C 138 380, 150 440, 154 470 Q 200 488 246 470 C 250 440, 262 380, 260 336";

function GlassVase() {
  return (
    <g>
      <path d={`${GLASS_BODY} Z`} fill="url(#vase-glass)" />
      {/* Water, which also tints the stems beneath it */}
      <path d="M143 368 C 144 400, 151 440, 154 470 Q 200 488 246 470 C 249 440, 256 400, 257 368 Q 200 376 143 368 Z" fill="url(#vase-water)" />
      <ellipse cx={200} cy={369} rx={57} ry={5} fill="#e8f7fa" fillOpacity={0.4} />
      <path d="M144 369 Q 200 377 256 369" fill="none" stroke="#ffffff" strokeOpacity={0.6} strokeWidth={1.2} />
      {/* Thick glass base */}
      <path d="M153 462 Q 200 478 247 462 L 246 470 Q 200 488 154 470 Z" fill="#5f9aa6" fillOpacity={0.5} />
      <path d="M160 470 Q 200 482 240 470" fill="none" stroke="#ffffff" strokeOpacity={0.35} strokeWidth={1.2} />
      <path d={GLASS_BODY} fill="none" stroke="#98c3ca" strokeWidth={2} />
      {/* Reflections */}
      <path d="M150 348 C 148 392, 156 432, 160 462 L 168 462 C 164 430, 158 390, 159 348 Z" fill="#ffffff" fillOpacity={0.55} />
      <path d="M246 352 C 248 392, 244 430, 240 458 L 244 458 C 249 430, 252 392, 250 352 Z" fill="#ffffff" fillOpacity={0.28} />
      <ellipse cx={176} cy={466} rx={14} ry={2.6} fill="#ffffff" fillOpacity={0.35} />
      {/* Near half of the rim */}
      <path d="M140 336 A 60 8 0 0 0 260 336" fill="none" stroke="#a3cbd1" strokeWidth={3} />
      <path d="M144 337 A 56 7 0 0 0 256 337" fill="none" stroke="#ffffff" strokeOpacity={0.6} strokeWidth={1.2} />
    </g>
  );
}

function Wrap({ style, colors }: { style: VaseStyle; colors: WrapColors }) {
  const { paper, shade, tie } = colors;
  const tissue = style === "tissue";
  return (
    <g>
      <g filter={tissue ? undefined : "url(#vase-grain)"}>
        <path d={WRAP_OUTLINE} fill={paper} />
      </g>
      <path d="M88 322 L180 482 L200 482 L150 346 Z" fill={shade} opacity={0.7} />
      <path d="M312 322 L220 482 L232 482 L262 344 Z" fill={shade} opacity={0.5} />
      <path d={WRAP_OUTLINE} fill="url(#vase-round)" />
      <path d={WRAP_OUTLINE} fill="url(#vase-inner)" opacity={0.7} />

      {style === "newspaper" && (
        // Faux newsprint: a headline bar and columns of text lines.
        <g fill="#8c8478" fillOpacity={0.45} clipPath="url(#vase-wrap-clip)">
          <rect x={168} y={350} width={74} height={7} rx={2} />
          {[366, 374, 382, 440, 448, 456].map((y) => (
            <g key={y}>
              <rect x={166 + (y - 366) * 0.14} y={y} width={34 - (y - 366) * 0.12} height={3} rx={1.5} />
              <rect x={206} y={y} width={36 - (y - 366) * 0.18} height={3} rx={1.5} />
            </g>
          ))}
          <rect x={120} y={346} width={30} height={5} rx={2} transform="rotate(34 135 348)" />
          <rect x={250} y={346} width={30} height={5} rx={2} transform="rotate(-34 265 348)" />
        </g>
      )}

      {/* Folds: a dark crease with a light edge beside it */}
      <g fill="none" strokeLinecap="round">
        {[
          "M112 330 L182 478",
          "M138 344 L188 480",
          "M200 332 L200 480",
          "M262 344 L212 480",
          "M288 330 L218 478",
        ].map((d, i) => (
          <g key={d}>
            <path d={d} stroke="#000" strokeOpacity={tissue ? 0.1 : 0.12} strokeWidth={1.2} />
            <path d={d} stroke="#fff" strokeOpacity={0.3} strokeWidth={1.2} transform={`translate(${i % 2 ? -1.6 : 1.6} 0)`} />
          </g>
        ))}
      </g>
      {tissue && (
        // Crinkled tissue: extra short wrinkles
        <g fill="none" stroke="#9b86c9" strokeOpacity={0.22} strokeWidth={1} strokeLinecap="round">
          <path d="M150 372 Q 158 380 154 392 M236 380 Q 246 392 240 404 M178 430 Q 188 436 184 448 M222 436 Q 214 446 220 458" />
        </g>
      )}

      {/* Paper edge with a little thickness */}
      <path d="M88 322 L138 344 L200 330 L262 344 L312 322" fill="none" stroke="#000" strokeOpacity={0.1} strokeWidth={2.5} strokeLinejoin="round" transform="translate(0 2)" />
      <path d="M88 322 L138 344 L200 330 L262 344 L312 322" fill="none" stroke="#ffffff" strokeOpacity={0.6} strokeWidth={1.6} strokeLinejoin="round" />

      {style === "newspaper" ? <Twine color={tie} /> : <Bow color={tie} />}
    </g>
  );
}

function Bow({ color }: { color: string }) {
  const loop = "M0 0 C -30 -26, -46 -4, -36 10 C -26 20, -10 8, 0 0 Z";
  const loopInner = "M-4 0 C -22 -14, -34 -2, -29 7 C -22 13, -10 6, -4 0 Z";
  const tail = "M-1 3 L -21 44 L -13 42 L -9 50 L 3 7 Z";
  return (
    <g transform="translate(200 410)">
      {/* drop shadow under the bow */}
      <path d="M-34 14 C -20 24, -6 12, 0 4 C 6 12, 20 24, 34 14" fill="none" stroke="#000" strokeOpacity={0.12} strokeWidth={5} strokeLinecap="round" />
      <path d={tail} fill={color} />
      <path d={tail} fill="#000" fillOpacity={0.16} />
      <path d={tail} fill={color} transform="scale(-1 1)" />
      <path d={tail} fill="#000" fillOpacity={0.08} transform="scale(-1 1)" />
      {[1, -1].map((side) => (
        <g key={side} transform={`scale(${side} 1)`}>
          <path d={loop} fill={color} />
          <path d={loopInner} fill="#000" fillOpacity={0.2} />
          <path d="M-30 -11 C -38 -8, -41 0, -38 5" fill="none" stroke="#fff" strokeOpacity={0.5} strokeWidth={1.6} strokeLinecap="round" />
        </g>
      ))}
      <circle r={7} fill={color} stroke="#000" strokeOpacity={0.15} strokeWidth={1} />
      <circle r={7} fill="none" stroke="#ffffff" strokeOpacity={0.4} strokeWidth={1.5} />
      <ellipse cx={-2} cy={-2.5} rx={3} ry={1.8} fill="#fff" fillOpacity={0.45} />
    </g>
  );
}

function Twine({ color }: { color: string }) {
  return (
    <g fill="none" strokeLinecap="round">
      {/* two wraps of twine, each with a darker twist pattern */}
      {["M150 404 Q 200 414 250 404", "M152 412 Q 200 422 248 412"].map((d) => (
        <g key={d}>
          <path d={d} stroke="#000" strokeOpacity={0.14} strokeWidth={5} transform="translate(0 1.5)" />
          <path d={d} stroke={color} strokeWidth={3.4} />
          <path d={d} stroke="#6a4c26" strokeWidth={3.4} strokeDasharray="1.4 3" opacity={0.7} />
          <path d={d} stroke="#e6c998" strokeWidth={1} opacity={0.55} transform="translate(0 -0.8)" />
        </g>
      ))}
      <path d="M200 412 C 184 396, 176 410, 192 414" stroke={color} strokeWidth={3} />
      <path d="M200 412 C 216 396, 224 410, 208 414" stroke={color} strokeWidth={3} />
      <path d="M198 414 L 190 436" stroke={color} strokeWidth={3} />
      <path d="M202 414 L 212 434" stroke={color} strokeWidth={3} />
      <path d="M190 436 L 186 442 M212 434 L 216 440" stroke={color} strokeWidth={1.4} opacity={0.7} />
      <circle cx={200} cy={413} r={3.4} fill={color} stroke="#6a4c26" strokeOpacity={0.5} strokeWidth={0.8} />
    </g>
  );
}

function MasonJar() {
  return (
    <g>
      {/* Body with shoulders */}
      <path
        d="M146 366 C 146 356, 152 352, 154 348 L 246 348 C 248 352, 254 356, 254 366 L 254 466 Q 254 482 238 482 L 162 482 Q 146 482 146 466 Z"
        fill="url(#vase-glass)"
      />
      <path d="M147 384 L 253 384 L 253 466 Q 253 480 238 480 L 162 480 Q 147 480 147 466 Z" fill="url(#vase-water)" />
      <ellipse cx={200} cy={385} rx={53} ry={4.5} fill="#e8f7fa" fillOpacity={0.4} />
      <path d="M148 385 Q 200 392 252 385" fill="none" stroke="#fff" strokeOpacity={0.6} strokeWidth={1.2} />
      {/* thick glass base */}
      <path d="M149 470 Q 200 480 251 470 L 252 474 Q 200 486 148 474 Z" fill="#5f9aa6" fillOpacity={0.4} />
      <path
        d="M146 366 C 146 356, 152 352, 154 348 M246 348 C 248 352, 254 356, 254 366 L 254 466 Q 254 482 238 482 L 162 482 Q 146 482 146 466 Z"
        fill="none"
        stroke="#98c3ca"
        strokeWidth={2.2}
      />
      {/* Threaded neck */}
      <rect x={152} y={326} width={96} height={22} rx={4} fill="url(#vase-glass)" stroke="#98c3ca" strokeWidth={2.2} />
      {[330, 337, 344].map((y) => (
        <path key={y} d={`M154 ${y + 2} Q 200 ${y - 2} 246 ${y + 2}`} fill="none" stroke="#98c3ca" strokeWidth={1.6} />
      ))}
      <path d="M153 326 A 47 5 0 0 0 247 326" fill="none" stroke="#b6d6db" strokeWidth={2.4} />
      <path d="M156 328 A 44 4 0 0 0 244 328" fill="none" stroke="#ffffff" strokeOpacity={0.6} strokeWidth={1} />
      {/* Twine with a small bow */}
      <rect x={148} y={348} width={104} height={7} rx={3} fill="#b08a5a" />
      <path d="M150 351.5 L250 351.5" stroke="#6a4c26" strokeWidth={6} strokeDasharray="1.4 3" opacity={0.55} />
      <rect x={148} y={348} width={104} height={2} rx={1} fill="#e6c998" opacity={0.6} />
      <rect x={148} y={354} width={104} height={2} rx={1} fill="#000" opacity={0.12} />
      <path d="M232 352 C 222 338, 214 352, 230 356 M232 352 C 244 338, 250 352, 234 356" stroke="#b08a5a" strokeWidth={3} fill="none" />
      <path d="M231 356 L 226 374 M234 356 L 240 372" stroke="#b08a5a" strokeWidth={3} strokeLinecap="round" />
      <circle cx={232} cy={354} r={3} fill="#b08a5a" stroke="#6a4c26" strokeOpacity={0.5} strokeWidth={0.8} />
      {/* Embossed label */}
      <rect x={176} y={400} width={48} height={30} rx={6} fill="#ffffff" fillOpacity={0.22} />
      <rect x={176} y={400} width={48} height={30} rx={6} fill="none" stroke="#ffffff" strokeOpacity={0.5} strokeWidth={1.2} />
      <rect x={176} y={401.5} width={48} height={30} rx={6} fill="none" stroke="#5f9aa6" strokeOpacity={0.35} strokeWidth={1} />
      <path d="M186 412 H214 M190 420 H210" stroke="#ffffff" strokeOpacity={0.45} strokeWidth={2} strokeLinecap="round" />
      {/* Reflections */}
      <path d="M152 366 C 151 400, 153 440, 156 466 L 164 466 C 161 438, 159 400, 160 366 Z" fill="#ffffff" fillOpacity={0.5} />
      <path d="M242 370 L 243 450 L 247 450 L 247 370 Z" fill="#ffffff" fillOpacity={0.25} />
    </g>
  );
}

function Pitcher() {
  const body = "M150 336 C 126 384, 124 446, 160 480 L240 480 C 276 446, 274 384, 250 336 Z";
  const handle = "M246 352 C 292 352, 300 420, 252 440";
  return (
    <g>
      {/* Handle: a dark base stroke with lighter ones stacked on top reads as a rounded ceramic loop */}
      <path d={handle} fill="none" stroke="#5f7e59" strokeWidth={14} strokeLinecap="round" />
      <path d={handle} fill="none" stroke="#8fae86" strokeWidth={10} strokeLinecap="round" />
      <path d={handle} fill="none" stroke="#bcd4b3" strokeWidth={3.5} strokeLinecap="round" opacity={0.8} transform="translate(-0.5 -1)" />
      {/* Foot ring */}
      <path d="M158 478 L242 478 L240 486 Q 200 490 160 486 Z" fill="#6f8c68" />
      <path d="M160 480 L240 480" stroke="#fff" strokeOpacity={0.3} strokeWidth={1.2} />
      {/* Body */}
      <path d={body} fill="url(#vase-ceramic)" />
      <path d={body} fill="url(#vase-inner)" opacity={0.8} />
      {/* Spout and rim */}
      <path d="M152 334 L 124 322 L 150 352 Z" fill="#7f9d77" />
      <path d="M150 334 L 128 325 L 148 346 Z" fill="#a9c3a0" />
      <path d="M148 338 Q 200 352 252 338" fill="none" stroke="#4a6445" strokeOpacity={0.5} strokeWidth={6} strokeLinecap="round" transform="translate(0 2)" />
      <path d="M150 336 Q 200 348 250 336" fill="none" stroke="#cfe0c8" strokeWidth={5} strokeLinecap="round" />
      <path d="M156 335 Q 190 343 220 342" fill="none" stroke="#ffffff" strokeOpacity={0.6} strokeWidth={1.4} strokeLinecap="round" />
      {/* Painted daisies */}
      {[
        [196, 412],
        [228, 444],
        [180, 456],
      ].map(([x, y]) => (
        <g key={`${x}-${y}`} transform={`translate(${x} ${y})`}>
          {[0, 60, 120, 180, 240, 300].map((r) => (
            <ellipse key={r} cx={0} cy={-6} rx={3} ry={5.5} transform={`rotate(${r})`} fill="#ffffff" fillOpacity={0.9} stroke="#cfdcc8" strokeWidth={0.4} />
          ))}
          <circle r={3} fill="#efc24a" />
          <circle cx={-0.8} cy={-0.8} r={1} fill="#fff3b0" />
        </g>
      ))}
      {/* Glaze highlights */}
      <path d="M150 372 C 140 402, 142 440, 160 468" fill="none" stroke="#ffffff" strokeOpacity={0.4} strokeWidth={6} strokeLinecap="round" />
      <path d="M236 358 C 246 386, 248 420, 240 448" fill="none" stroke="#ffffff" strokeOpacity={0.3} strokeWidth={4} strokeLinecap="round" />
    </g>
  );
}

function Basket() {
  // Woven rows: offset rounded cells, clipped to the basket's tapered body.
  const rows = [352, 372, 392, 412, 432, 452];
  const edge = (y: number) => 120 + (y - 344) * (18 / 126);
  return (
    <g>
      <path d="M120 344 L280 344 L262 470 Q200 486 138 470 Z" fill="#a97c45" />
      <g clipPath="url(#vase-basket-clip)">
        {rows.map((y, r) => {
          const left = edge(y);
          const cells = Math.ceil((400 - 2 * left) / 24) + 2;
          return (
            <g key={y}>
              {Array.from({ length: cells }, (_, c) => {
                const x = left - (r % 2) * 12 + c * 24 - 12;
                return (
                  <g key={c}>
                    <rect x={x} y={y} width={23} height={17} rx={5} fill={(c + r) % 2 ? "#b98a52" : "#cfa06a"} stroke="#8a5d2c" strokeWidth={0.8} />
                    <rect x={x + 3} y={y + 2} width={17} height={3.5} rx={1.7} fill="#ffffff" fillOpacity={(c + r) % 2 ? 0.1 : 0.2} />
                  </g>
                );
              })}
            </g>
          );
        })}
        <path d="M120 344 L280 344 L262 470 Q200 486 138 470 Z" fill="url(#vase-round)" />
        <path d="M120 344 L280 344 L262 470 Q200 486 138 470 Z" fill="url(#vase-inner)" opacity={0.8} />
      </g>
      <path d="M120 344 L138 470 Q200 486 262 470 L280 344" fill="none" stroke="#8a5d2c" strokeWidth={1.6} />
      {/* Rim: a thick twisted rope */}
      <rect x={114} y={332} width={172} height={16} rx={8} fill="#b7864f" />
      {Array.from({ length: 17 }, (_, i) => (
        <path key={i} d={`M${124 + i * 9.5} 334 l 5 12`} stroke="#8a5d2c" strokeWidth={1.6} strokeLinecap="round" opacity={0.65} />
      ))}
      <rect x={114} y={332} width={172} height={16} rx={8} fill="url(#vase-inner)" opacity={0.6} />
      <path d="M122 337 L278 337" stroke="#e8c48a" strokeWidth={2.4} strokeOpacity={0.7} strokeLinecap="round" />
    </g>
  );
}
