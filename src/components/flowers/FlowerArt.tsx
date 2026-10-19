import type { FlowerId } from "@/types/bouquet";

/**
 * Flower heads drawn around the origin (roughly a 70×70 box), so they can be
 * placed with a single translate() inside the bouquet canvas or a thumbnail.
 */

const range = (n: number) => Array.from({ length: n }, (_, i) => i);
/** Round so server (Node) and browser floating-point output match during hydration. */
const round = (n: number) => Math.round(n * 100) / 100;

function Daisy() {
  return (
    <g>
      {range(14).map((i) => (
        <ellipse
          key={i}
          cx={0}
          cy={-19}
          rx={6}
          ry={15}
          fill="#ffffff"
          stroke="#e9e1d4"
          strokeWidth={1}
          transform={`rotate(${(360 / 14) * i})`}
        />
      ))}
      <circle r={10} fill="#f2c94c" />
      <circle r={10} fill="url(#daisy-center)" opacity={0.6} />
    </g>
  );
}

function Sunflower() {
  return (
    <g>
      {range(18).map((i) => (
        <path
          key={i}
          d="M0 -12 C 6 -20, 5 -30, 0 -36 C -5 -30, -6 -20, 0 -12 Z"
          fill={i % 2 ? "#f7c23c" : "#f4b02a"}
          transform={`rotate(${(360 / 18) * i})`}
        />
      ))}
      <circle r={15} fill="#6b4423" />
      {range(12).map((i) => (
        <circle
          key={i}
          r={1.6}
          cx={round(Math.cos(i * 2.4) * (3 + (i % 4) * 2.8))}
          cy={round(Math.sin(i * 2.4) * (3 + (i % 4) * 2.8))}
          fill="#3f2914"
        />
      ))}
    </g>
  );
}

function Rose() {
  return (
    <g>
      <circle r={25} fill="#e0697f" />
      <path d="M-24 4 C -20 -20, 20 -24, 24 2 C 14 -8, -12 -10, -24 4 Z" fill="#c94b64" />
      <path d="M-18 10 C -18 -10, 18 -12, 18 8 C 8 -2, -8 -2, -18 10 Z" fill="#f08a9c" />
      <circle r={12} fill="#d4566f" />
      <path
        d="M-8 0 C -8 -9, 8 -9, 8 0 C 8 6, -2 7, -3 1 C -3 -3, 3 -3, 3 0"
        fill="none"
        stroke="#9e3149"
        strokeWidth={2}
        strokeLinecap="round"
      />
      <path d="M-25 8 C -14 26, 14 26, 25 8 C 14 18, -14 18, -25 8 Z" fill="#b8435b" />
    </g>
  );
}

function Tulip() {
  return (
    <g transform="translate(0 4)">
      <path d="M-20 -6 C -22 -28, -8 -34, 0 -30 C 8 -34, 22 -28, 20 -6 C 18 12, -18 12, -20 -6 Z" fill="#f28da0" />
      <path d="M-20 -6 C -20 -26, -12 -30, -6 -28 C -4 -14, -8 0, -12 8 C -18 4, -20 0, -20 -6 Z" fill="#e8738a" />
      <path d="M20 -6 C 20 -26, 12 -30, 6 -28 C 4 -14, 8 0, 12 8 C 18 4, 20 0, 20 -6 Z" fill="#e8738a" />
      <path d="M-8 -28 L 0 -40 L 8 -28 C 6 -16, -6 -16, -8 -28 Z" fill="#f7a8b6" />
    </g>
  );
}

function BabysBreath() {
  const buds = [
    [0, -22], [-14, -16], [14, -16], [-22, -2], [22, -2], [-8, -6],
    [8, -6], [0, 6], [-16, 12], [16, 12], [-6, -30], [8, -30],
  ];
  return (
    <g>
      {buds.map(([x, y], i) => (
        <line key={`s${i}`} x1={0} y1={22} x2={x} y2={y} stroke="#9bb391" strokeWidth={1.2} />
      ))}
      {buds.map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <circle r={5} fill="#ffffff" stroke="#e7e2da" strokeWidth={0.8} />
          <circle r={1.6} fill="#f1e7c9" />
        </g>
      ))}
    </g>
  );
}

function Lavender() {
  return (
    <g>
      {range(9).map((i) => {
        const y = 22 - i * 7;
        const w = 6 - i * 0.35;
        return (
          <g key={i}>
            <ellipse cx={-w * 0.7} cy={y} rx={w * 0.8} ry={4.2} fill={i % 2 ? "#9b86c9" : "#8a73bd"} transform={`rotate(-20 ${-w * 0.7} ${y})`} />
            <ellipse cx={w * 0.7} cy={y - 2} rx={w * 0.8} ry={4.2} fill={i % 2 ? "#8a73bd" : "#a894d4"} transform={`rotate(20 ${w * 0.7} ${y - 2})`} />
          </g>
        );
      })}
      <ellipse cx={0} cy={-42} rx={3} ry={4} fill="#b6a3dd" />
    </g>
  );
}

function Chrysanthemum() {
  return (
    <g>
      {range(24).map((i) => (
        <ellipse
          key={`o${i}`}
          cx={0}
          cy={-20}
          rx={3.6}
          ry={15}
          fill={i % 2 ? "#d9622b" : "#c9501f"}
          transform={`rotate(${(360 / 24) * i})`}
        />
      ))}
      {range(16).map((i) => (
        <ellipse
          key={`i${i}`}
          cx={0}
          cy={-12}
          rx={3}
          ry={10}
          fill={i % 2 ? "#f08a3c" : "#e87a2e"}
          transform={`rotate(${(360 / 16) * i + 11})`}
        />
      ))}
      <circle r={6} fill="#f6b04a" />
    </g>
  );
}

function Marigold() {
  return (
    <g>
      {range(16).map((i) => (
        <ellipse
          key={`o${i}`}
          cx={0}
          cy={-19}
          rx={7}
          ry={13}
          fill={i % 2 ? "#f2a516" : "#e8920c"}
          stroke="#c97a08"
          strokeWidth={0.6}
          transform={`rotate(${(360 / 16) * i})`}
        />
      ))}
      {range(10).map((i) => (
        <ellipse
          key={`i${i}`}
          cx={0}
          cy={-11}
          rx={5.5}
          ry={9}
          fill={i % 2 ? "#f7bd3a" : "#f2a516"}
          transform={`rotate(${(360 / 10) * i + 18})`}
        />
      ))}
      <circle r={5} fill="#c9650a" />
    </g>
  );
}

function Dahlia() {
  return (
    <g>
      {range(16).map((i) => (
        <path
          key={`o${i}`}
          d="M0 -8 C 7 -16, 6 -27, 0 -35 C -6 -27, -7 -16, 0 -8 Z"
          fill={i % 2 ? "#a3203f" : "#8c1833"}
          transform={`rotate(${(360 / 16) * i})`}
        />
      ))}
      {range(12).map((i) => (
        <path
          key={`m${i}`}
          d="M0 -5 C 5 -11, 4 -19, 0 -26 C -4 -19, -5 -11, 0 -5 Z"
          fill={i % 2 ? "#c23a58" : "#b02e4c"}
          transform={`rotate(${(360 / 12) * i + 15})`}
        />
      ))}
      {range(8).map((i) => (
        <path
          key={`n${i}`}
          d="M0 -2 C 3 -7, 3 -12, 0 -16 C -3 -12, -3 -7, 0 -2 Z"
          fill={i % 2 ? "#e0607a" : "#d44e6b"}
          transform={`rotate(${(360 / 8) * i})`}
        />
      ))}
      <circle r={2.6} fill="#f2c94c" />
    </g>
  );
}

function Wheat() {
  return (
    <g>
      {range(7).map((i) => {
        const y = 14 - i * 8.5;
        return (
          <g key={i}>
            <ellipse cx={-4.5} cy={y} rx={2.8} ry={5.5} fill={i % 2 ? "#d9a441" : "#c9932f"} transform={`rotate(-28 -4.5 ${y})`} />
            <ellipse cx={4.5} cy={y - 2} rx={2.8} ry={5.5} fill={i % 2 ? "#c9932f" : "#e0b052"} transform={`rotate(28 4.5 ${y - 2})`} />
          </g>
        );
      })}
      <ellipse cx={0} cy={-52} rx={2.8} ry={6} fill="#e0b052" />
      {range(5).map((i) => (
        <line key={i} x1={0} y1={-56} x2={(i - 2) * 2.5} y2={-72} stroke="#d9b866" strokeWidth={0.9} />
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
};

export function FlowerHead({ id }: { id: FlowerId }) {
  const Art = ART[id];
  return <Art />;
}

/** Shared SVG gradient defs. Render once inside any <svg> using FlowerHead. */
export function FlowerDefs() {
  return (
    <defs>
      <radialGradient id="daisy-center">
        <stop offset="0%" stopColor="#fff3b0" />
        <stop offset="100%" stopColor="#d99a1e" />
      </radialGradient>
    </defs>
  );
}

/** Standalone thumbnail used by the FlowerPicker. */
export function FlowerThumbnail({ id, className }: { id: FlowerId; className?: string }) {
  return (
    <svg viewBox="-45 -45 90 90" className={className} aria-hidden="true">
      <FlowerDefs />
      <FlowerHead id={id} />
    </svg>
  );
}
