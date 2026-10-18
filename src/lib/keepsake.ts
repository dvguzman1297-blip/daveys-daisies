"use client";

import type { BouquetFlower, LetterTheme, VaseStyle } from "@/types/bouquet";

export interface KeepsakeInput {
  to: string;
  from: string;
  message: string;
  theme: LetterTheme;
  flowers: BouquetFlower[];
  vase: VaseStyle;
}

const THEME = {
  parchment: { bg: "#f6ecd6", border: "#e6d6b3", text: "#3b3530", soft: "#6b625a", line: "rgba(0,0,0,0.07)" },
  blush: { bg: "#fdf0f1", border: "#f3bfc8", text: "#3b3530", soft: "#6b625a", line: "rgba(0,0,0,0.07)" },
  midnight: { bg: "#23264a", border: "#3a3f6b", text: "#fbf7ee", soft: "rgba(251,247,238,0.7)", line: "rgba(255,255,255,0.1)" },
} as const;

const W = 1080;
const PAD = 60;
const CARD_W = W - PAD * 2;
const CARD_PAD = 64;
const FONT_SIZE = 46;
const LINE_H = 64;
const MAX_H = 16000; // stay under browsers' canvas limits

/** Resolves a next/font CSS variable (e.g. "--font-caveat") to a usable font-family. */
const family = (cssVar: string, fallback: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim() || fallback;

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  for (const paragraph of text.split("\n")) {
    if (!paragraph.trim()) {
      lines.push("");
      continue;
    }
    let line = "";
    for (const word of paragraph.split(/\s+/).filter(Boolean)) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width <= maxWidth) {
        line = test;
        continue;
      }
      if (line) lines.push(line);
      // A single word wider than the card (a long URL, say) is broken by character.
      let rest = word;
      while (ctx.measureText(rest).width > maxWidth) {
        let n = rest.length;
        while (n > 1 && ctx.measureText(rest.slice(0, n)).width > maxWidth) n--;
        lines.push(rest.slice(0, n));
        rest = rest.slice(n);
      }
      line = rest;
    }
    lines.push(line);
  }
  return lines;
}

async function bouquetImage(flowers: BouquetFlower[], vase: VaseStyle): Promise<HTMLImageElement> {
  const [{ renderToStaticMarkup }, { createElement }, { StaticBouquet }] = await Promise.all([
    import("react-dom/server"),
    import("react"),
    import("@/components/StaticBouquet"),
  ]);
  // Padded viewBox so flower heads near the edge aren't clipped. Rendering the <svg> itself
  // (not just its children) lets React treat tags like radialGradient as SVG.
  const svg = renderToStaticMarkup(
    createElement(
      "svg",
      { xmlns: "http://www.w3.org/2000/svg", viewBox: "-20 40 440 460", width: 880, height: 920 },
      createElement(StaticBouquet, { flowers, vase }),
    ),
  );
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Draws the bouquet and letter together as one PNG, for keeping. */
export async function renderKeepsake(input: KeepsakeInput): Promise<Blob> {
  const t = THEME[input.theme];
  const hand = family("--font-caveat", "cursive");
  const display = family("--font-fraunces", "Georgia, serif");
  const sans = family("--font-nunito", "system-ui, sans-serif");
  await Promise.all([
    document.fonts.load(`${FONT_SIZE}px ${hand}`),
    document.fonts.load(`600 60px ${display}`),
    document.fonts.load(`700 24px ${sans}`),
  ]);
  const bouquet = await bouquetImage(input.flowers, input.vase);

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported");

  // Lay out the letter first, so we know how tall the page must be.
  ctx.font = `${FONT_SIZE}px ${hand}`;
  const maxLines = Math.floor((MAX_H - 1900) / LINE_H);
  let lines = wrap(ctx, input.message.trim(), CARD_W - CARD_PAD * 2);
  if (lines.length > maxLines) lines = [...lines.slice(0, maxLines - 1), "…"];

  const bouquetW = 840;
  const bouquetH = bouquetW * (920 / 880);
  const cardTop = PAD + bouquetH + 30;
  const bodyTop = cardTop + CARD_PAD + 110;
  const cardH = 110 + CARD_PAD * 2 + lines.length * LINE_H + 40 + 2 * LINE_H;
  canvas.width = W;
  canvas.height = Math.ceil(cardTop + cardH + PAD + 40);

  // Page
  ctx.fillStyle = "#fbf7ee";
  ctx.fillRect(0, 0, W, canvas.height);
  ctx.drawImage(bouquet, (W - bouquetW) / 2, PAD, bouquetW, bouquetH);

  // Letter card
  ctx.beginPath();
  ctx.roundRect(PAD, cardTop, CARD_W, cardH, 48);
  ctx.fillStyle = t.bg;
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = t.border;
  ctx.stroke();

  const x = PAD + CARD_PAD;
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = t.soft;
  ctx.font = `700 24px ${sans}`;
  ctx.letterSpacing = "4px";
  ctx.fillText("DEAR", x, cardTop + CARD_PAD + 24);
  ctx.letterSpacing = "0px";
  ctx.fillStyle = t.text;
  ctx.font = `600 60px ${display}`;
  ctx.fillText(`${input.to},`, x, cardTop + CARD_PAD + 90, CARD_W - CARD_PAD * 2);

  ctx.font = `${FONT_SIZE}px ${hand}`;
  lines.forEach((line, i) => {
    const y = bodyTop + i * LINE_H + 40;
    ctx.strokeStyle = t.line;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y + 14);
    ctx.lineTo(x + CARD_W - CARD_PAD * 2, y + 14);
    ctx.stroke();
    ctx.fillStyle = t.text;
    ctx.fillText(line, x, y);
  });

  const signY = bodyTop + lines.length * LINE_H + 40 + LINE_H;
  ctx.textAlign = "right";
  ctx.fillStyle = t.soft;
  ctx.fillText("With love,", PAD + CARD_W - CARD_PAD, signY);
  ctx.fillStyle = t.text;
  ctx.fillText(input.from, PAD + CARD_W - CARD_PAD, signY + LINE_H);

  ctx.textAlign = "center";
  ctx.fillStyle = "#6b625a";
  ctx.font = `700 24px ${sans}`;
  ctx.fillText("Sent with Davey's Daisies", W / 2, canvas.height - 40);

  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Could not create image"))), "image/png"),
  );
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement("a"), { href: url, download: filename });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
