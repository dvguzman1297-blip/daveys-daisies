import { memo } from "react";
import type { FlowerId } from "@/types/bouquet";

/**
 * Flower heads drawn around the origin (roughly a 70×70 box), so they can be
 * placed with a single translate() inside the bouquet canvas or a thumbnail.
 *
 * Realism comes from three things, all deterministic so server and browser
 * output match during hydration:
 *  - petals are drawn base-at-origin pointing up (-y) with a base-to-tip
 *    gradient, then rotated into rings;
 *  - every petal is jittered (angle, length, width, skew, lightness) from a
 *    seeded generator, so no two petals match;
 *  - each ring casts a soft shadow onto the ring beneath it (see FlowerDefs).
 */

const range = (n: number) => Array.from({ length: n }, (_, i) => i);
/** Round so server (Node) and browser floating-point output match during hydration. */
const round = (n: number) => Math.round(n * 100) / 100;
const GOLDEN_ANGLE = 2.39996323;

/** Small seeded PRNG (mulberry32) — same seed, same sequence, on server and client. */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface RingProps {
  /** Petal outline, base at the origin, tip toward -y. */
  d: string;
  n: number;
  fill: string;
  seed: number;
  /** Base rotation offset in degrees. */
  off?: number;
  /** Overall scale of the ring. */
  s?: number;
  stroke?: string;
  sw?: number;
  /** Jitter: rotation (deg), length (fraction), width (fraction), skew (deg). */
  jr?: number;
  jl?: number;
  jw?: number;
  jk?: number;
  /** Max opacity of the random light/dark wash that varies petal brightness. */
  shade?: number;
  /** Optional centre vein and edge highlight, as path data in petal space. */
  vein?: string;
  veinColor?: string;
  rim?: string;
  rimColor?: string;
  /** Cast a soft shadow onto whatever is beneath this ring. */
  shadow?: "petal-shadow" | "petal-shadow-sm" | null;
}

function Ring({
  d, n, fill, seed, off = 0, s = 1, stroke, sw = 0.5,
  jr = 4, jl = 0.1, jw = 0.08, jk = 0, shade = 0.1,
  vein, veinColor = "#000", rim, rimColor = "#fff", shadow = "petal-shadow",
}: RingProps) {
  const rand = rng(seed);
  return (
    <g filter={shadow ? `url(#${shadow})` : undefined}>
      {range(n).map((i) => {
        const a = (360 / n) * i + off + (rand() - 0.5) * 2 * jr;
        const sy = s * (1 + (rand() - 0.5) * 2 * jl);
        const sx = s * (1 + (rand() - 0.5) * 2 * jw);
        const k = (rand() - 0.5) * 2 * jk;
        const t = rand();
        return (
          <g key={i} transform={`rotate(${round(a)}) skewX(${round(k)}) scale(${round(sx)} ${round(sy)})`}>
            <path d={d} fill={fill} stroke={stroke} strokeWidth={stroke ? sw : undefined} strokeLinejoin="round" />
            {shade > 0 && <path d={d} fill={t > 0.5 ? "#ffffff" : "#1a0508"} opacity={round(Math.abs(t - 0.5) * 2 * shade)} />}
            {vein && <path d={vein} fill="none" stroke={veinColor} strokeWidth={0.5} opacity={0.4} strokeLinecap="round" />}
            {rim && <path d={rim} fill="none" stroke={rimColor} strokeWidth={0.9} opacity={0.45} strokeLinecap="round" />}
          </g>
        );
      })}
    </g>
  );
}

function Daisy() {
  const petal = "M0 -8 C 4 -14, 5.5 -28, 1.7 -36 C 0.8 -35.4, -0.8 -35.4, -1.7 -36 C -5.5 -28, -4 -14, 0 -8 Z";
  const seeds = range(46).map((i) => {
    const r = 1.35 * Math.sqrt(i + 1);
    return { x: round(Math.cos(i * GOLDEN_ANGLE) * r), y: round(Math.sin(i * GOLDEN_ANGLE) * r) };
  });
  return (
    <g>
      <Ring d={petal} n={16} fill="#f1ede3" seed={101} off={11} s={1} jr={6} jl={0.12} jw={0.1} shade={0} shadow="petal-shadow-sm" />
      <Ring
        d={petal} n={14} fill="url(#daisy-petal)" stroke="#e1d8c6" sw={0.5} seed={102}
        jr={5} jl={0.13} jw={0.1} jk={7} shade={0.08}
        vein="M0 -10 L 0 -31" veinColor="#c9bfa8" rim="M-3 -14 C -3.6 -22, -2.6 -29, -1 -33" rimColor="#ffffff"
      />
      <circle r={12.5} fill="#9c6a0c" opacity={0.35} />
      <circle r={11} fill="#c98f14" />
      <circle r={10} fill="url(#daisy-center)" />
      {seeds.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={0.75} fill={i % 3 ? "#b57a0c" : "#f9e28a"} opacity={0.75} />
      ))}
      <ellipse cx={-3} cy={-4} rx={4} ry={2.4} fill="#fffbe0" opacity={0.35} transform="rotate(-30 -3 -4)" />
    </g>
  );
}

function Sunflower() {
  const petal = "M0 -12 C 7 -20, 7 -32, 1.2 -40 C 0.5 -41, -0.5 -41, -1.2 -40 C -7 -32, -7 -20, 0 -12 Z";
  const seeds = range(78).map((i) => {
    const r = 1.65 * Math.sqrt(i + 1);
    return { x: round(Math.cos(i * GOLDEN_ANGLE) * r), y: round(Math.sin(i * GOLDEN_ANGLE) * r), r: round(0.85 + r * 0.05), i };
  });
  const edge = range(34);
  return (
    <g>
      <Ring d={petal} n={22} fill="url(#sunflower-back)" seed={201} off={8} s={1.04} jr={6} jl={0.14} jw={0.1} jk={8} shade={0.1} />
      <Ring
        d={petal} n={21} fill="url(#sunflower-front)" stroke="#d98f10" sw={0.45} seed={202}
        jr={5} jl={0.15} jw={0.1} jk={9} shade={0.1}
        vein="M0 -14 L 0 -35" veinColor="#b9700a" rim="M-4 -18 C -5 -26, -3.4 -33, -1 -38" rimColor="#fff2a8"
      />
      <circle r={18} fill="#2b1809" opacity={0.45} />
      <circle r={16.5} fill="#8a5712" />
      <circle r={15} fill="url(#sunflower-disc)" />
      {edge.map((i) => (
        <circle
          key={`e${i}`}
          cx={round(Math.cos((i / 34) * Math.PI * 2) * 14.2)}
          cy={round(Math.sin((i / 34) * Math.PI * 2) * 14.2)}
          r={1.2}
          fill={i % 2 ? "#d69a1f" : "#b87a14"}
        />
      ))}
      {seeds.map((p) => (
        <g key={p.i}>
          <circle cx={p.x} cy={p.y} r={p.r} fill={p.i % 3 ? "#2a170a" : "#3e250f"} />
          <circle cx={round(p.x - p.r * 0.3)} cy={round(p.y - p.r * 0.3)} r={round(p.r * 0.35)} fill="#8a6a3a" opacity={0.5} />
        </g>
      ))}
    </g>
  );
}

function Rose() {
  const outer = "M0 -5 C -18 -6, -18 -26, -5 -30 C 0 -32, 4 -31, 8 -29 C 19 -25, 19 -9, 0 -5 Z";
  const mid = "M0 -3 C -13 -4, -13 -19, -3 -22 C 1 -23, 5 -23, 8 -20 C 15 -16, 13 -5, 0 -3 Z";
  const inner = "M0 -2 C -8 -2, -8 -12, -2 -14 C 3 -15, 8 -10, 6 -4 C 5 -2, 2 -2, 0 -2 Z";
  const bud = "M0 -1 C -4 -1, -4 -7, -1 -8 C 2 -8, 4 -5, 3 -2 C 2 -1, 1 -1, 0 -1 Z";
  return (
    <g>
      <Ring
        d={outer} n={5} fill="url(#rose-outer)" stroke="#86203a" sw={0.5} seed={301}
        jr={7} jl={0.08} jw={0.1} jk={6} shade={0.1} rim="M-15 -12 C -17 -23, -9 -30, -1 -30.5 C 8 -30, 16 -24, 15 -13" rimColor="#f6a3b6"
      />
      <Ring
        d={mid} n={5} fill="url(#rose-mid)" stroke="#9c2a46" sw={0.5} seed={302} off={36}
        jr={7} jl={0.08} jw={0.1} jk={6} shade={0.1} rim="M-11 -9 C -12 -17, -6 -22, 1 -22 C 8 -22, 13 -16, 11 -8" rimColor="#f9b4c4"
      />
      <circle r={20} fill="url(#rose-depth)" />
      <Ring
        d={inner} n={4} fill="url(#rose-inner)" stroke="#b03351" sw={0.5} seed={303} off={20}
        jr={8} jl={0.1} jw={0.1} jk={6} shade={0.1} rim="M-6 -8 C -7 -12, -3 -14, 1 -14 C 5 -14, 8 -10, 6 -5" rimColor="#fbc3d0"
      />
      <Ring d={bud} n={3} fill="url(#rose-inner)" stroke="#8c2340" sw={0.5} seed={304} off={50} jr={10} jl={0.1} jw={0.1} shade={0.1} shadow="petal-shadow-sm" />
      <path
        d="M-3 1 C -4 -4, 3 -5, 4 -1 C 4 3, -1 4, -2 1 C -2 -1, 1 -1, 1 0"
        fill="none"
        stroke="#6f1830"
        strokeWidth={0.9}
        strokeLinecap="round"
      />
      <path d="M-13 -15 C -7 -22, 3 -23, 9 -19" fill="none" stroke="#ffffff" strokeWidth={1.1} strokeLinecap="round" opacity={0.2} />
    </g>
  );
}

function Tulip() {
  return (
    <g transform="translate(0 4)">
      {/* dark cup interior, visible in the gaps between petals */}
      <path d="M-16 -6 C -20 -26, -8 -36, 0 -31 C 8 -36, 20 -26, 16 -6 C 10 6, -10 6, -16 -6 Z" fill="#6e1835" />
      <g filter="url(#petal-shadow)">
        <path d="M-17 0 C -29 -20, -20 -38, -9 -38 C -12 -26, -9 -8, -5 8 C -13 7, -17 4, -17 0 Z" fill="url(#tulip-side)" stroke="#b8305a" strokeWidth={0.5} />
        <path d="M17 0 C 29 -20, 20 -38, 9 -38 C 12 -26, 9 -8, 5 8 C 13 7, 17 4, 17 0 Z" fill="url(#tulip-side)" stroke="#b8305a" strokeWidth={0.5} />
      </g>
      <g filter="url(#petal-shadow)">
        <path d="M-10 7 C -17 -8, -12 -30, 0 -41 C 12 -30, 17 -8, 10 7 C 5 12, -5 12, -10 7 Z" fill="url(#tulip-front)" stroke="#cf4a75" strokeWidth={0.5} />
        {/* feathered colour streaks, like a real tulip */}
        <path d="M0 9 C -1 -8, 1 -24, 0 -37" fill="none" stroke="#fde1e8" strokeWidth={2.2} opacity={0.22} strokeLinecap="round" />
        <path d="M-7 8 C -11 -6, -9 -22, -4 -34 M7 8 C 11 -6, 9 -22, 4 -34" fill="none" stroke="#fde1e8" strokeWidth={1.4} opacity={0.2} strokeLinecap="round" />
        <path d="M-4 9 C -6 -4, -5 -20, -2 -33 M4 9 C 6 -4, 5 -20, 2 -33" fill="none" stroke="#cf4a75" strokeWidth={0.6} opacity={0.5} />
        <path d="M-12 -6 C -13 -17, -9 -27, -3 -34" fill="none" stroke="#ffffff" strokeWidth={1.5} strokeLinecap="round" opacity={0.3} />
      </g>
    </g>
  );
}

function BabysBreath() {
  const rand = rng(501);
  const blooms: [number, number][] = [
    [0, -22], [-14, -16], [14, -16], [-22, -2], [22, -2], [-8, -6],
    [8, -6], [0, 6], [-16, 12], [16, 12], [-6, -30], [8, -30],
  ];
  const buds: [number, number][] = [[-11, -26], [12, -24], [-20, -10], [19, -10], [-4, 0], [3, -14], [-12, 4], [13, 4]];
  const stems = blooms.map(([x, y], i) => ({ x, y, i, size: round(0.8 + rand() * 0.45), rot: round(rand() * 72) }));
  return (
    <g>
      {stems.map(({ x, y, i }) => (
        <path key={`s${i}`} d={`M0 22 Q ${round(x * 0.3)} ${(22 + y) / 2} ${x} ${y}`} fill="none" stroke="#8fae85" strokeWidth={0.9} />
      ))}
      {buds.map(([x, y], i) => (
        <g key={`b${i}`}>
          <circle cx={x} cy={y} r={2} fill="#e9eddc" stroke="#b6c7a8" strokeWidth={0.5} />
          <circle cx={x - 0.5} cy={y - 0.5} r={0.7} fill="#ffffff" />
        </g>
      ))}
      <g>
      {stems.map(({ x, y, i, size, rot }) => (
        <g key={i} transform={`translate(${x} ${y}) rotate(${rot}) scale(${size})`} filter="url(#petal-shadow-sm)">
          {range(5).map((p) => (
            <ellipse
              key={p}
              cx={round(Math.cos((p * Math.PI * 2) / 5) * 3)}
              cy={round(Math.sin((p * Math.PI * 2) / 5) * 3)}
              rx={2.8}
              ry={2.5}
              fill={p % 2 ? "#ffffff" : "#fbfaf6"}
              stroke="#e4ded2"
              strokeWidth={0.4}
              transform={`rotate(${p * 72} ${round(Math.cos((p * Math.PI * 2) / 5) * 3)} ${round(Math.sin((p * Math.PI * 2) / 5) * 3)})`}
            />
          ))}
          <circle r={1.6} fill="#dccf86" />
          <circle r={0.7} fill="#a8953c" />
        </g>
      ))}
      </g>
    </g>
  );
}

function Lavender() {
  const rand = rng(601);
  const tones = ["#7d66b8", "#8c76c6", "#9a86d0", "#a894d9", "#7459b0"];
  const whorls = range(11).map((i) => {
    const y = 23 - i * 5.8;
    const w = 6.4 - i * 0.4;
    return {
      y, w, i,
      l: tones[Math.floor(rand() * tones.length)],
      r: tones[Math.floor(rand() * tones.length)],
      c: tones[Math.floor(rand() * tones.length)],
      jl: round((rand() - 0.5) * 10),
      jr: round((rand() - 0.5) * 10),
    };
  });
  return (
    <g>
      <path d="M0 27 C -1.5 5, 1.5 -20, 0 -44" fill="none" stroke="#6f8c5f" strokeWidth={1.7} strokeLinecap="round" />
      <g>
      {whorls.map(({ y, w, i, l, r, c, jl, jr }) => (
        <g key={i}>
          <ellipse cx={0} cy={y + 1.5} rx={w * 0.55} ry={2.2} fill="#7f9a6e" />
          <g filter="url(#petal-shadow-sm)">
            <ellipse cx={-w * 0.75} cy={y} rx={w * 0.72} ry={3.7} fill={l} stroke="#5f4a99" strokeWidth={0.4} transform={`rotate(${-24 + jl} ${-w * 0.75} ${y})`} />
            <ellipse cx={w * 0.75} cy={y - 2.4} rx={w * 0.72} ry={3.7} fill={r} stroke="#5f4a99" strokeWidth={0.4} transform={`rotate(${24 + jr} ${w * 0.75} ${y - 2.4})`} />
            <ellipse cx={0} cy={y - 1.2} rx={w * 0.5} ry={3.3} fill={c} stroke="#5f4a99" strokeWidth={0.3} />
          </g>
          <ellipse cx={-w * 0.75} cy={y} rx={w * 0.72} ry={3.7} fill="url(#petal-gloss)" transform={`rotate(${-24 + jl} ${-w * 0.75} ${y})`} />
          <ellipse cx={w * 0.75} cy={y - 2.4} rx={w * 0.72} ry={3.7} fill="url(#petal-gloss)" transform={`rotate(${24 + jr} ${w * 0.75} ${y - 2.4})`} />
        </g>
      ))}
      </g>
      <ellipse cx={0} cy={-46} rx={2.6} ry={4.2} fill="#b9a7e4" stroke="#7a66b4" strokeWidth={0.4} />
    </g>
  );
}

function Chrysanthemum() {
  const petal = "M0 -5 C 4 -9, 4.4 -26, 0.6 -34 C 0.3 -34.4, -0.3 -34.4, -0.6 -34 C -4.4 -26, -4 -9, 0 -5 Z";
  // count, rotation offset, scale, seed
  const rings: [number, number, number, number][] = [
    [34, 0, 1.16, 701],
    [27, 6, 0.96, 702],
    [20, 10, 0.74, 703],
    [14, 0, 0.52, 704],
  ];
  return (
    <g>
      {rings.map(([n, off, s, seed]) => (
        <Ring
          key={seed} d={petal} n={n} fill="url(#chry-petal)" stroke="#a8340f" sw={0.3} seed={seed} off={off} s={s}
          jr={3} jl={0.09} jw={0.1} jk={4} shade={0.12} vein="M0 -8 L 0 -29" veinColor="#8a2a0a"
          rim="M-1.6 -12 C -2.4 -19, -2 -26, -0.4 -31" rimColor="#ffd08a"
        />
      ))}
      <circle r={5.4} fill="#7a3a0a" opacity={0.5} />
      <circle r={4.6} fill="url(#chry-center)" />
    </g>
  );
}

function Marigold() {
  const petal = "M0 -4 C 9 -8, 12 -20, 7.5 -27 C 5 -25, 3.2 -28.5, 0 -26.5 C -3.2 -28.5, -5 -25, -7.5 -27 C -12 -20, -9 -8, 0 -4 Z";
  // count, rotation offset, scale, seed
  const rings: [number, number, number, number][] = [
    [14, 0, 1.26, 801],
    [12, 15, 1.04, 802],
    [10, 0, 0.8, 803],
    [8, 22, 0.57, 804],
    [6, 0, 0.36, 805],
  ];
  return (
    <g>
      {rings.map(([n, off, s, seed]) => (
        <Ring
          key={seed} d={petal} n={n} fill="url(#mari-petal)" stroke="#b8650a" sw={0.5} seed={seed} off={off} s={s}
          jr={6} jl={0.1} jw={0.12} jk={8} shade={0.14} vein="M0 -6 L 0 -23" veinColor="#8a4806"
          rim="M-6 -22 C -4 -25, -1.5 -24.5, 0 -23.5" rimColor="#ffe08a"
        />
      ))}
      <circle r={3.4} fill="#8f4207" />
    </g>
  );
}

function Dahlia() {
  const petal = "M0 -6 C 7 -14, 6 -27, 0 -36 C -6 -27, -7 -14, 0 -6 Z";
  // count, rotation offset, scale, seed
  const rings: [number, number, number, number][] = [
    [16, 0, 1, 901],
    [14, 11, 0.82, 902],
    [12, 0, 0.64, 903],
    [9, 20, 0.46, 904],
    [6, 0, 0.3, 905],
  ];
  return (
    <g>
      {rings.map(([n, off, s, seed]) => (
        <Ring
          key={seed} d={petal} n={n} fill="url(#dahlia-petal)" stroke="#5e0f26" sw={0.5} seed={seed} off={off} s={s}
          jr={5} jl={0.1} jw={0.1} jk={6} shade={0.12} vein="M0 -8 L 0 -30" veinColor="#3a0716"
          rim="M-3 -12 C -5 -20, -4.4 -28, -1.2 -34" rimColor="#ff9ab0"
        />
      ))}
      <circle r={2.6} fill="#c9922e" />
      <circle r={1.6} fill="#f2c95a" />
    </g>
  );
}

function Wheat() {
  const rand = rng(1001);
  const sides = [-1, 1];
  const kernels = range(7).flatMap((i) =>
    sides.map((side) => {
      const y = 14 - i * 7.2 - (side === 1 ? 2 : 0);
      return {
        key: `${i}${side}`, side, y, i,
        tilt: round(26 + (rand() - 0.5) * 8),
        awn: round(20 + rand() * 6 + i * 0.5),
        spread: round(7 + i * 0.5 + rand() * 2.5),
      };
    }),
  );
  return (
    <g>
      <path d="M0 27 C 1 10, -1 -10, 0 -34" fill="none" stroke="#b09a54" strokeWidth={1.8} strokeLinecap="round" />
      {/* awns: long bristles fanning up and out from each kernel tip */}
      {kernels.map(({ key, side, y, awn, spread }) => (
        <path
          key={`a${key}`}
          d={`M${side * 5.4} ${round(y - 8)} Q ${side * round(spread * 0.7)} ${round(y - awn * 0.6)} ${side * round(spread + 4)} ${round(y - awn - 6)}`}
          fill="none"
          stroke="#dcbd6c"
          strokeWidth={0.6}
          strokeLinecap="round"
          opacity={0.9}
        />
      ))}
      {kernels.map(({ key, side, y, tilt }) => (
        <g key={key} transform={`rotate(${side * tilt} ${side * 4.4} ${round(y)})`} filter="url(#petal-shadow-sm)">
          <ellipse cx={side * 4.4} cy={y} rx={3} ry={5.8} fill="url(#wheat-kernel)" stroke="#a06f16" strokeWidth={0.4} />
          <path d={`M${side * 4.4} ${round(y - 4.6)} L ${side * 4.4} ${round(y + 4.4)}`} stroke="#8a5d10" strokeWidth={0.4} opacity={0.55} />
          <ellipse cx={side * 3.6} cy={round(y - 1.5)} rx={0.9} ry={3.2} fill="#fff1c0" opacity={0.4} />
        </g>
      ))}
      <ellipse cx={0} cy={-42} rx={2.8} ry={6} fill="url(#wheat-kernel)" stroke="#a06f16" strokeWidth={0.4} />
      {range(5).map((i) => (
        <path key={i} d={`M0 -47 Q ${(i - 2) * 1.2} -60 ${(i - 2) * 3.4} -73`} fill="none" stroke="#dcbd6c" strokeWidth={0.7} strokeLinecap="round" />
      ))}
    </g>
  );
}

function Aster() {
  const petal = "M0 -5 C 2.2 -10, 2.6 -22, 0.5 -29 C 0.2 -29.5, -0.2 -29.5, -0.5 -29 C -2.6 -22, -2.2 -10, 0 -5 Z";
  return (
    <g>
      <Ring d={petal} n={26} fill="url(#aster-petal)" stroke="#d9d4e4" sw={0.3} seed={1401} jr={4} jl={0.1} jw={0.12} jk={6} shade={0.07} vein="M0 -7 L 0 -25" veinColor="#c9c2dc" />
      <Ring d={petal} n={20} fill="url(#aster-petal)" stroke="#d9d4e4" sw={0.3} seed={1402} off={9} s={0.78} jr={5} jl={0.1} jw={0.12} jk={6} shade={0.07} shadow={null} />
      <Ring d={petal} n={12} fill="url(#aster-petal)" seed={1403} off={4} s={0.5} jr={6} jl={0.1} jw={0.1} shade={0.06} shadow={null} />
      <circle r={5.2} fill="#b98a14" opacity={0.5} />
      <circle r={4.6} fill="url(#daisy-center)" />
      {range(9).map((i) => (
        <circle
          key={i}
          cx={round(Math.cos(i * GOLDEN_ANGLE) * 1.4 * Math.sqrt(i + 1) * 0.8)}
          cy={round(Math.sin(i * GOLDEN_ANGLE) * 1.4 * Math.sqrt(i + 1) * 0.8)}
          r={0.5}
          fill="#a87608"
          opacity={0.7}
        />
      ))}
    </g>
  );
}

function Peony() {
  const outer = "M0 -6 C 14 -10, 22 -24, 12 -33 C 9 -37, 5 -34, 0 -37 C -5 -34, -9 -37, -12 -33 C -22 -24, -14 -10, 0 -6 Z";
  const mid = "M0 -4 C 10 -8, 16 -19, 8 -26 C 5 -29, 2 -27, 0 -28.5 C -2 -27, -5 -29, -8 -26 C -16 -19, -10 -8, 0 -4 Z";
  const inner = "M0 -2 C 7 -5, 10 -12, 5 -17 C 3 -19, 1 -17, 0 -18 C -1 -17, -3 -19, -5 -17 C -10 -12, -7 -5, 0 -2 Z";
  return (
    <g>
      <Ring
        d={outer} n={10} fill="url(#peony-outer)" stroke="#e9a3b8" sw={0.5} seed={1101}
        jr={7} jl={0.1} jw={0.1} jk={8} shade={0.08} vein="M0 -9 L 0 -31" veinColor="#c9557a"
        rim="M-9 -28 C -5 -34, 5 -34, 9 -28" rimColor="#ffffff"
      />
      <Ring
        d={mid} n={9} fill="url(#peony-mid)" stroke="#e48aa5" sw={0.5} seed={1102} off={16}
        jr={8} jl={0.1} jw={0.1} jk={8} shade={0.08} rim="M-6 -24 C -3 -28, 3 -28, 6 -24" rimColor="#ffffff"
      />
      <Ring d={inner} n={7} fill="url(#peony-core)" stroke="#d96f90" sw={0.5} seed={1103} off={9} jr={10} jl={0.12} jw={0.12} jk={8} shade={0.08} />
      <Ring d={inner} n={5} fill="url(#peony-core)" stroke="#cf5f84" sw={0.5} seed={1104} off={30} s={0.6} jr={12} jl={0.12} jw={0.12} shade={0.08} shadow="petal-shadow-sm" />
      <circle r={3.4} fill="#c9557a" opacity={0.7} />
      <circle r={1.6} fill="#f3c6d3" opacity={0.8} />
    </g>
  );
}

function Poppy() {
  const rand = rng(1201);
  const big = "M0 -2 C -20 -8, -24 -32, -6 -36 C 6 -38, 22 -30, 18 -14 C 16 -6, 8 -2, 0 -2 Z";
  const small = "M0 -2 C -16 -8, -18 -26, -4 -29 C 6 -30, 17 -24, 14 -12 C 12 -6, 6 -2, 0 -2 Z";
  const creases = range(14).map((i) => ({
    a: round((360 / 14) * i + (rand() - 0.5) * 14),
    len: round(15 + rand() * 9),
  }));
  return (
    <g>
      <Ring d={big} n={4} fill="url(#poppy-petal)" seed={1201} off={45} jr={8} jl={0.07} jw={0.1} jk={8} shade={0.1} />
      <Ring d={small} n={4} fill="url(#poppy-petal)" seed={1202} jr={8} jl={0.07} jw={0.1} jk={8} shade={0.1} />
      {/* tissue-paper creases */}
      {creases.map(({ a, len }, i) => (
        <path
          key={i}
          d={`M0 -9 Q 1.5 ${-9 - len / 2} 0 ${-9 - len}`}
          fill="none"
          stroke={i % 2 ? "#8f1417" : "#ff7a63"}
          strokeWidth={0.55}
          opacity={0.4}
          transform={`rotate(${a})`}
        />
      ))}
      {/* the dark blotch at the base of each petal */}
      {[0, 90, 180, 270].map((deg) => (
        <path
          key={deg}
          d="M0 -2 C -7 -3, -8 -13, 0 -14 C 8 -13, 7 -3, 0 -2 Z"
          fill="#150a10"
          opacity={0.72}
          transform={`rotate(${deg + 8})`}
        />
      ))}
      <circle r={9} fill="#2a1a24" />
      <circle r={5.4} fill="#6b7d43" />
      {range(8).map((i) => (
        <line key={i} x1={0} y1={0} x2={0} y2={-5.2} stroke="#4a5a2c" strokeWidth={0.6} transform={`rotate(${i * 45})`} />
      ))}
      <circle r={1.3} fill="#9bad6a" />
      {range(18).map((i) => (
        <g key={`s${i}`}>
          <line
            x1={round(Math.cos((i * Math.PI * 2) / 18) * 8)}
            y1={round(Math.sin((i * Math.PI * 2) / 18) * 8)}
            x2={round(Math.cos((i * Math.PI * 2) / 18) * 11)}
            y2={round(Math.sin((i * Math.PI * 2) / 18) * 11)}
            stroke="#1b1118"
            strokeWidth={0.5}
          />
          <circle
            r={1.1}
            cx={round(Math.cos((i * Math.PI * 2) / 18) * 11.4)}
            cy={round(Math.sin((i * Math.PI * 2) / 18) * 11.4)}
            fill="#2c2236"
          />
        </g>
      ))}
    </g>
  );
}

function Hydrangea() {
  const rand = rng(1301);
  const tints = ["#6f86cf", "#7a8fd8", "#8d7fd0", "#9fb0e6", "#a78fdc", "#b49be0", "#86a4e8"];
  // Lay florets out on a golden-angle spiral (even coverage, no gaps), nudge
  // each a little, and draw the outermost first so the dome's centre sits on top.
  const florets = range(46)
    .map((i) => {
      const dist = Math.sqrt((i + 0.5) / 46);
      const a = i * GOLDEN_ANGLE;
      return {
        x: round(Math.cos(a) * dist * 33 + (rand() - 0.5) * 3),
        y: round(Math.sin(a) * dist * 31 + (rand() - 0.5) * 3),
        r: round(0.78 + rand() * 0.4 + (1 - dist) * 0.12),
        rot: round(rand() * 90),
        c: tints[Math.floor(rand() * tints.length)],
        dist,
      };
    })
    .sort((a, b) => b.dist - a.dist);
  const petal = "M0 -1 C 6 -2, 7.5 -9, 0.5 -11 C -6 -10, -5.5 -2, 0 -1 Z";
  // Three depth layers (outermost first). Each floret gets a cheap contact shadow
  // (a dark disc, no filter); each layer gets one soft shadow filter over the top.
  const layers = [florets.slice(0, 16), florets.slice(16, 32), florets.slice(32)];
  return (
    <g>
      <ellipse cx={0} cy={0} rx={30} ry={28} fill="#4a5aa8" opacity={0.55} />
      {layers.map((layer, li) => (
        <g key={li} filter="url(#petal-shadow-sm)">
          {layer.map((f, i) => (
            <g key={i} transform={`translate(${f.x} ${f.y}) rotate(${f.rot}) scale(${f.r})`}>
              <circle cx={0.6} cy={1.4} r={9.5} fill="#1f2866" opacity={0.2} />
              {range(4).map((p) => (
                <g key={p} transform={`rotate(${p * 90})`}>
                  <path d={petal} fill={f.c} stroke="#5c6cb8" strokeWidth={0.35} />
                  <path d={petal} fill="url(#petal-gloss)" />
                </g>
              ))}
              <circle r={1.5} fill="#e4e9b8" stroke="#b9c07a" strokeWidth={0.3} />
            </g>
          ))}
        </g>
      ))}
    </g>
  );
}

const ART: Record<FlowerId, () => React.JSX.Element> = {
  daisy: Daisy,
  sunflower: Sunflower,
  rose: Rose,
  tulip: Tulip,
  "babys-breath": BabysBreath,
  lavender: Lavender,
  chrysanthemum: Chrysanthemum,
  marigold: Marigold,
  dahlia: Dahlia,
  wheat: Wheat,
  peony: Peony,
  poppy: Poppy,
  hydrangea: Hydrangea,
  aster: Aster,
};

export function FlowerHead({ id }: { id: FlowerId }) {
  const Art = ART[id];
  return <Art />;
}

const ALL_FLOWER_IDS = Object.keys(ART) as FlowerId[];

/**
 * Draws flowers once into <defs> so repeated heads can <use> them instead of
 * re-creating hundreds of SVG nodes per head. `prefix` keeps the ids unique to
 * whichever component owns the sprite. Memoized: the art never changes, so it
 * only re-renders if the prefix or the set of flowers does.
 *
 * This does NOT include the shared gradients and filters (FlowerDefs): those
 * are mounted once for the whole page by <SvgDefs /> in the root layout.
 * Duplicate ids break Safari, which keeps pointing at a copy that has since
 * been removed from the page.
 */
export const FlowerSpriteDefs = memo(
  function FlowerSpriteDefs({ prefix, ids = ALL_FLOWER_IDS }: { prefix: string; ids?: FlowerId[] }) {
    return (
      <defs>
        {ids.map((id) => (
          <g key={id} id={`${prefix}${id}`}>
            <FlowerHead id={id} />
          </g>
        ))}
      </defs>
    );
  },
  (a, b) => a.prefix === b.prefix && (a.ids ?? ALL_FLOWER_IDS).join() === (b.ids ?? ALL_FLOWER_IDS).join(),
);

/** A flower drawn by a FlowerSpriteDefs with the same prefix. */
export function FlowerRef({ id, prefix }: { id: FlowerId; prefix: string }) {
  return <use href={`#${prefix}${id}`} />;
}

/** Zero-size svg holding a sprite, for sibling svgs (thumbnails, cards) to <use>. */
export function FlowerSprite({ prefix, ids }: { prefix: string; ids?: FlowerId[] }) {
  return (
    <svg width={0} height={0} aria-hidden="true" focusable="false" style={{ position: "absolute" }}>
      <FlowerSpriteDefs prefix={prefix} ids={ids} />
    </svg>
  );
}

/**
 * Shared SVG gradient and filter defs. Mount exactly ONE per document (the root
 * layout does, via <SvgDefs />); a standalone SVG export embeds its own.
 * Petal gradients are base-centered (cx 0.5, cy 1) so the base is shaded and
 * the tip catches the light.
 */
export function FlowerDefs() {
  return (
    <defs>
      {/* Soft contact shadow cast by a ring of petals onto the layer beneath. */}
      <filter id="petal-shadow" x="-30%" y="-30%" width="165%" height="175%" colorInterpolationFilters="sRGB">
        <feGaussianBlur in="SourceAlpha" stdDeviation={1.5} result="blur" />
        <feOffset in="blur" dx={0.5} dy={1.2} result="off" />
        <feComponentTransfer in="off" result="shadow">
          <feFuncA type="linear" slope={0.5} />
        </feComponentTransfer>
        <feMerge>
          <feMergeNode in="shadow" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id="petal-shadow-sm" x="-50%" y="-50%" width="200%" height="215%" colorInterpolationFilters="sRGB">
        <feGaussianBlur in="SourceAlpha" stdDeviation={0.7} result="blur" />
        <feOffset in="blur" dx={0.3} dy={0.6} result="off" />
        <feComponentTransfer in="off" result="shadow">
          <feFuncA type="linear" slope={0.45} />
        </feComponentTransfer>
        <feMerge>
          <feMergeNode in="shadow" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      {/* A soft white sheen, strongest toward the petal tip. */}
      <radialGradient id="petal-gloss" cx="0.5" cy="1" r="1">
        <stop offset="0%" stopColor="#ffffff" stopOpacity={0} />
        <stop offset="100%" stopColor="#ffffff" stopOpacity={0.38} />
      </radialGradient>

      <radialGradient id="daisy-center">
        <stop offset="0%" stopColor="#fff3b0" />
        <stop offset="100%" stopColor="#d99a1e" />
      </radialGradient>
      <radialGradient id="daisy-petal" cx="0.5" cy="1" r="1">
        <stop offset="0%" stopColor="#efe0a0" />
        <stop offset="30%" stopColor="#ffffff" />
        <stop offset="100%" stopColor="#fbfaf6" />
      </radialGradient>

      <radialGradient id="aster-petal" cx="0.5" cy="1" r="1">
        <stop offset="0%" stopColor="#f1e6b4" />
        <stop offset="35%" stopColor="#ffffff" />
        <stop offset="100%" stopColor="#f3f0fa" />
      </radialGradient>

      <radialGradient id="sunflower-back" cx="0.5" cy="1" r="1">
        <stop offset="0%" stopColor="#b86a0b" />
        <stop offset="100%" stopColor="#eea01d" />
      </radialGradient>
      <radialGradient id="sunflower-front" cx="0.5" cy="1" r="1">
        <stop offset="0%" stopColor="#dc8a10" />
        <stop offset="50%" stopColor="#f6b628" />
        <stop offset="100%" stopColor="#ffd24a" />
      </radialGradient>
      <radialGradient id="sunflower-disc">
        <stop offset="0%" stopColor="#6e6a2a" />
        <stop offset="45%" stopColor="#4a2c12" />
        <stop offset="100%" stopColor="#2b1809" />
      </radialGradient>

      <radialGradient id="rose-outer" cx="0.5" cy="1" r="1">
        <stop offset="0%" stopColor="#8a1c36" />
        <stop offset="100%" stopColor="#e2607c" />
      </radialGradient>
      <radialGradient id="rose-mid" cx="0.5" cy="1" r="1">
        <stop offset="0%" stopColor="#a02844" />
        <stop offset="100%" stopColor="#ef7f98" />
      </radialGradient>
      <radialGradient id="rose-inner" cx="0.5" cy="1" r="1">
        <stop offset="0%" stopColor="#b02d4c" />
        <stop offset="100%" stopColor="#f59bb0" />
      </radialGradient>
      {/* Darkens the heart of the rose so the bloom reads as a deep cup. */}
      <radialGradient id="rose-depth">
        <stop offset="0%" stopColor="#3a0a18" stopOpacity={0.5} />
        <stop offset="100%" stopColor="#3a0a18" stopOpacity={0} />
      </radialGradient>

      <linearGradient id="tulip-front" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0%" stopColor="#d23f6b" />
        <stop offset="60%" stopColor="#ec7a9a" />
        <stop offset="100%" stopColor="#fbb3c4" />
      </linearGradient>
      <linearGradient id="tulip-side" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0%" stopColor="#b82e59" />
        <stop offset="100%" stopColor="#e9779a" />
      </linearGradient>

      <radialGradient id="chry-petal" cx="0.5" cy="1" r="1">
        <stop offset="0%" stopColor="#a8340f" />
        <stop offset="50%" stopColor="#d9602a" />
        <stop offset="100%" stopColor="#f4a24a" />
      </radialGradient>
      <radialGradient id="chry-center">
        <stop offset="0%" stopColor="#f9d36a" />
        <stop offset="100%" stopColor="#d98a2a" />
      </radialGradient>

      <radialGradient id="mari-petal" cx="0.5" cy="1" r="1">
        <stop offset="0%" stopColor="#b4560a" />
        <stop offset="50%" stopColor="#e8920c" />
        <stop offset="100%" stopColor="#fbc23d" />
      </radialGradient>

      <radialGradient id="dahlia-petal" cx="0.5" cy="1" r="1">
        <stop offset="0%" stopColor="#5e0f26" />
        <stop offset="55%" stopColor="#a3203f" />
        <stop offset="100%" stopColor="#e0607a" />
      </radialGradient>

      <linearGradient id="wheat-kernel" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0%" stopColor="#a8741a" />
        <stop offset="100%" stopColor="#e8c066" />
      </linearGradient>

      <radialGradient id="peony-outer" cx="0.5" cy="1" r="1">
        <stop offset="0%" stopColor="#e9779c" />
        <stop offset="100%" stopColor="#fbd9e4" />
      </radialGradient>
      <radialGradient id="peony-mid" cx="0.5" cy="1" r="1">
        <stop offset="0%" stopColor="#df5c86" />
        <stop offset="100%" stopColor="#f6bcd0" />
      </radialGradient>
      <radialGradient id="peony-core" cx="0.5" cy="1" r="1">
        <stop offset="0%" stopColor="#cf4575" />
        <stop offset="100%" stopColor="#f0a0bb" />
      </radialGradient>
      <radialGradient id="poppy-petal" cx="0.3" cy="1" r="1.1">
        <stop offset="0%" stopColor="#7d0f14" />
        <stop offset="45%" stopColor="#d3262b" />
        <stop offset="100%" stopColor="#f0503f" />
      </radialGradient>
    </defs>
  );
}

/**
 * Thumbnail of one flower. Pass `spritePrefix` when a FlowerSprite with that
 * prefix is on the page, so a grid of thumbnails shares one copy of the art
 * instead of drawing one each. Relies on <SvgDefs /> (root layout) for gradients.
 */
export function FlowerThumbnail({ id, className, spritePrefix }: { id: FlowerId; className?: string; spritePrefix?: string }) {
  return (
    <svg viewBox="-45 -45 90 90" className={className} aria-hidden="true">
      {spritePrefix ? <FlowerRef id={id} prefix={spritePrefix} /> : <FlowerHead id={id} />}
    </svg>
  );
}
