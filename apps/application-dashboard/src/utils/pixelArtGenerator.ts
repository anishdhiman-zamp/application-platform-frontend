// Pixel-art SVG generator for avatars and org icons
// Generates deterministic pixel art from seed strings using Zamp brand colors

export const ZAMP_COLORS = ['#C5C5B5', '#3B673B', '#848484', '#682C4B', '#D0DDA3', '#005eff'];

const BLUES = ['#005eff'];

// ── Seed & RNG ───────────────────────────────────────────────────────────────

function makeSeed(text: string): number {
  let h = 0;

  for (let i = 0; i < text.length; i++) {
    h = ((h << 5) - h + text.toLowerCase().charCodeAt(i)) | 0;
  }

  return Math.abs(h) || 1;
}

function makeRng(seed: number): () => number {
  let s = seed;

  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);

    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── Color utilities ──────────────────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);

  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function luminance([r, g, b]: [number, number, number]): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const v = c / 255;

    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(c1: string, c2: string): number {
  const l1 = luminance(hexToRgb(c1));
  const l2 = luminance(hexToRgb(c2));

  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

function pickContrasting(candidate: string, against: string, minRatio = 2.0): string {
  if (contrastRatio(candidate, against) >= minRatio) return candidate;
  let best = candidate;
  let bestR = 0;

  for (const c of ZAMP_COLORS) {
    const cr = contrastRatio(c, against);

    if (cr > bestR) {
      bestR = cr;
      best = c;
    }
  }

  return best;
}

function pickBlueBiased(rng: () => number): string {
  if (rng() < 0.5) return BLUES[Math.floor(rng() * BLUES.length)];

  return ZAMP_COLORS[Math.floor(rng() * ZAMP_COLORS.length)];
}

// ── SVG renderer ─────────────────────────────────────────────────────────────

interface Pill {
  x: number;
  y: number;
  color: string;
}

function renderPillsToSvg(pills: Pill[], cols: number, rows: number, cellSize: number, cornerRadius: number): string {
  const pw = cellSize * 0.88;
  const ph = cellSize * 0.88;
  const rx = ph * cornerRadius;
  const w = cols * cellSize;
  const h = rows * cellSize;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">`;

  for (const p of pills) {
    const cx = p.x * cellSize + cellSize / 2;
    const cy = p.y * cellSize + cellSize / 2;

    svg += `<rect x="${(cx - pw / 2).toFixed(1)}" y="${(cy - ph / 2).toFixed(1)}" width="${pw.toFixed(1)}" height="${ph.toFixed(1)}" rx="${rx.toFixed(1)}" ry="${rx.toFixed(1)}" fill="${p.color}"/>`;
  }
  svg += `</svg>`;

  return svg;
}

// ── Avatar (person) ──────────────────────────────────────────────────────────

const BASE_HEAD = [
  '....SSSSSS....',
  '..SSSSSSSSSS..',
  '.SSSSSSSSSSSS.',
  '.SSSSSSSSSSSS.',
  'SSSSSSSSSSSSSS',
  'SSSSSSSSSSSSSS',
  'SSSSSSSSSSSSSS',
  'SSSSSSSSSSSSSS',
  'SSSSSSSSSSSSSS',
  'SSSSSSSSSSSSSS',
  '.SSSSSSSSSSSS.',
  '.SSSSSSSSSSSS.',
  '..SSSSSSSSSS..',
  '....SSSSSS....',
];

const HAIR_STYLES: [number, number][][] = [
  [
    [0, 4],
    [0, 5],
    [0, 6],
    [0, 7],
    [0, 8],
    [0, 9],
    [1, 2],
    [1, 3],
    [1, 4],
    [1, 5],
    [1, 6],
    [1, 7],
    [1, 8],
    [1, 9],
    [1, 10],
    [1, 11],
    [2, 1],
    [2, 2],
    [2, 3],
    [2, 4],
    [2, 5],
    [2, 6],
    [2, 7],
    [2, 8],
    [2, 9],
    [2, 10],
    [2, 11],
    [2, 12],
    [3, 1],
    [3, 2],
    [3, 11],
    [3, 12],
  ],
  [
    [0, 4],
    [0, 5],
    [0, 6],
    [0, 7],
    [0, 8],
    [0, 9],
    [1, 2],
    [1, 3],
    [1, 4],
    [1, 5],
    [1, 6],
    [1, 7],
    [1, 8],
    [1, 9],
    [1, 10],
    [1, 11],
    [2, 1],
    [2, 2],
    [2, 3],
    [2, 4],
    [2, 5],
    [3, 1],
    [3, 2],
    [3, 3],
    [4, 0],
    [4, 1],
  ],
  [
    [-1, 5],
    [-1, 6],
    [-1, 7],
    [-1, 8],
    [0, 3],
    [0, 4],
    [0, 5],
    [0, 6],
    [0, 7],
    [0, 8],
    [0, 9],
    [0, 10],
    [1, 2],
    [1, 3],
    [1, 4],
    [1, 5],
    [1, 6],
    [1, 7],
    [1, 8],
    [1, 9],
    [1, 10],
    [1, 11],
    [2, 1],
    [2, 2],
    [2, 3],
    [2, 4],
    [2, 5],
    [2, 6],
    [2, 7],
    [2, 8],
    [2, 9],
    [2, 10],
    [2, 11],
    [2, 12],
    [3, 1],
    [3, 2],
    [3, 3],
    [3, 4],
    [3, 5],
    [3, 6],
    [3, 7],
  ],
  [
    [-2, 4],
    [-2, 5],
    [-2, 6],
    [-2, 7],
    [-2, 8],
    [-2, 9],
    [-1, 3],
    [-1, 4],
    [-1, 5],
    [-1, 6],
    [-1, 7],
    [-1, 8],
    [-1, 9],
    [-1, 10],
    [0, 2],
    [0, 3],
    [0, 4],
    [0, 5],
    [0, 6],
    [0, 7],
    [0, 8],
    [0, 9],
    [0, 10],
    [0, 11],
    [1, 1],
    [1, 2],
    [1, 3],
    [1, 4],
    [1, 5],
    [1, 6],
    [1, 7],
    [1, 8],
    [1, 9],
    [1, 10],
    [1, 11],
    [1, 12],
    [2, 0],
    [2, 1],
    [2, 12],
    [2, 13],
    [3, 0],
    [3, 1],
    [3, 12],
    [3, 13],
    [4, 0],
    [4, 13],
    [5, 0],
    [5, 13],
  ],
  [
    [-1, 3],
    [-1, 4],
    [-1, 5],
    [-1, 6],
    [-1, 7],
    [-1, 8],
    [-1, 9],
    [-1, 10],
    [0, 2],
    [0, 3],
    [0, 4],
    [0, 5],
    [0, 6],
    [0, 7],
    [0, 8],
    [0, 9],
    [0, 10],
    [0, 11],
    [1, 2],
    [1, 3],
    [1, 4],
    [1, 5],
    [1, 6],
    [1, 7],
    [1, 8],
    [1, 9],
    [1, 10],
    [1, 11],
    [2, 1],
    [2, 2],
    [2, 11],
    [2, 12],
  ],
];

const EYE_STYLES: [number, number][][] = [
  [
    [6, 3],
    [6, 4],
    [7, 3],
    [7, 4],
    [6, 9],
    [6, 10],
    [7, 9],
    [7, 10],
  ],
  [
    [5, 3],
    [5, 4],
    [6, 3],
    [6, 4],
    [7, 3],
    [7, 4],
    [5, 9],
    [5, 10],
    [6, 9],
    [6, 10],
    [7, 9],
    [7, 10],
  ],
  [
    [7, 3],
    [7, 4],
    [6, 2],
    [6, 5],
    [7, 9],
    [7, 10],
    [6, 8],
    [6, 11],
  ],
  [
    [5, 4],
    [6, 4],
    [7, 4],
    [5, 9],
    [6, 9],
    [7, 9],
  ],
];

const MOUTH_STYLES: [number, number][][] = [
  [
    [10, 6],
    [10, 7],
  ],
  [
    [10, 6],
    [10, 7],
    [9, 5],
    [9, 8],
  ],
  [
    [10, 5],
    [10, 6],
    [10, 7],
    [10, 8],
  ],
  [
    [9, 6],
    [9, 7],
    [10, 5],
    [10, 8],
    [11, 6],
    [11, 7],
  ],
];

export function generateAvatarSvg(name: string): string {
  const s = makeSeed(name);
  const r = makeRng(s);
  const hairIdx = Math.floor(r() * HAIR_STYLES.length);
  const eyeIdx = Math.floor(r() * EYE_STYLES.length);
  const mouthIdx = Math.floor(r() * MOUTH_STYLES.length);
  const skinColor = pickBlueBiased(r);
  const hairColor = pickBlueBiased(r);
  const eyeColor = pickBlueBiased(r);
  const mouthColor = pickBlueBiased(r);
  const finalHair = pickContrasting(hairColor, skinColor, 1.8);
  const finalEye = pickContrasting(eyeColor, skinColor, 2.5);
  const finalMouth = pickContrasting(mouthColor, skinColor, 2.0);

  const rowOffset = 3;
  const rows = 18;
  const cols = 14;
  const cellSize = 14;
  const g: (string | null)[][] = Array.from({ length: rows }, () => Array(cols).fill(null));

  const set = (row: number, col: number, color: string) => {
    const ri = row + rowOffset;

    if (ri >= 0 && ri < rows && col >= 0 && col < cols) g[ri][col] = color;
  };

  BASE_HEAD.forEach((rowStr, rowIdx) => {
    for (let c = 0; c < rowStr.length && c < cols; c++) {
      if (rowStr[c] === 'S') set(rowIdx, c, skinColor);
    }
  });

  HAIR_STYLES[hairIdx].forEach(([hr, hc]) => set(hr, hc, finalHair));
  EYE_STYLES[eyeIdx].forEach(([er, ec]) => set(er, ec, finalEye));
  MOUTH_STYLES[mouthIdx].forEach(([mr, mc]) => set(mr, mc, finalMouth));

  const pills: Pill[] = [];

  for (let ri = 0; ri < rows; ri++) {
    for (let ci = 0; ci < cols; ci++) {
      if (g[ri][ci]) pills.push({ x: ci, y: ri, color: g[ri][ci]! });
    }
  }

  return renderPillsToSvg(pills, cols, rows, cellSize, 0.28);
}

// ── Org icon (letter-based pixel art) ────────────────────────────────────────

const PIXEL_LETTERS: Record<string, string[]> = {
  A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
  B: ['11110', '10001', '10001', '11110', '10001', '10001', '11110'],
  C: ['01110', '10001', '10000', '10000', '10000', '10001', '01110'],
  D: ['11100', '10010', '10001', '10001', '10001', '10010', '11100'],
  E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
  F: ['11111', '10000', '10000', '11110', '10000', '10000', '10000'],
  G: ['01110', '10001', '10000', '10111', '10001', '10001', '01110'],
  H: ['10001', '10001', '10001', '11111', '10001', '10001', '10001'],
  I: ['01110', '00100', '00100', '00100', '00100', '00100', '01110'],
  J: ['00111', '00010', '00010', '00010', '00010', '10010', '01100'],
  K: ['10001', '10010', '10100', '11000', '10100', '10010', '10001'],
  L: ['10000', '10000', '10000', '10000', '10000', '10000', '11111'],
  M: ['10001', '11011', '10101', '10101', '10001', '10001', '10001'],
  N: ['10001', '11001', '10101', '10011', '10001', '10001', '10001'],
  O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
  P: ['11110', '10001', '10001', '11110', '10000', '10000', '10000'],
  Q: ['01110', '10001', '10001', '10001', '10101', '10010', '01101'],
  R: ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
  S: ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],
  T: ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
  U: ['10001', '10001', '10001', '10001', '10001', '10001', '01110'],
  V: ['10001', '10001', '10001', '10001', '01010', '01010', '00100'],
  W: ['10001', '10001', '10001', '10101', '10101', '11011', '10001'],
  X: ['10001', '01010', '01010', '00100', '01010', '01010', '10001'],
  Y: ['10001', '01010', '01010', '00100', '00100', '00100', '00100'],
  Z: ['11111', '00001', '00010', '00100', '01000', '10000', '11111'],
  HOME: ['00100', '01110', '11111', '11011', '11011', '11011', '11111'],
  '@': ['01110', '10001', '10111', '10101', '10110', '10000', '01110'],
};

function buildLetterPills(key: string, seed: string): Pill[] {
  const letterData = PIXEL_LETTERS[key];

  if (!letterData) return [];

  const gridSize = 16;
  const scale = 2;
  const lw = 5 * scale;
  const lh = 7 * scale;
  const offX = Math.floor((gridSize - lw) / 2);
  const offY = Math.floor((gridSize - lh) / 2);
  const rng = makeRng(makeSeed(seed));
  const color = pickBlueBiased(rng);
  const pills: Pill[] = [];

  for (let row = 0; row < 7; row++) {
    for (let col = 0; col < 5; col++) {
      if (letterData[row][col] === '1') {
        for (let sy = 0; sy < scale; sy++) {
          for (let sx = 0; sx < scale; sx++) {
            pills.push({ x: offX + col * scale + sx, y: offY + row * scale + sy, color });
          }
        }
      }
    }
  }

  return pills;
}

export function generateOrgIconSvg(name: string): string {
  if (!name) return renderPillsToSvg(buildLetterPills('HOME', 'home'), 16, 16, 14, 0.38);
  const ch = name.charAt(0).toUpperCase();

  return renderPillsToSvg(buildLetterPills(ch in PIXEL_LETTERS ? ch : 'HOME', name), 16, 16, 14, 0.38);
}

export function generateAtIconSvg(): string {
  return renderPillsToSvg(buildLetterPills('@', 'at-icon'), 16, 16, 14, 0.38);
}

export function generatePlaceholderSvg(): string {
  const letterData = ['01110', '10001', '00001', '00110', '00100', '00000', '00100'];
  const gridSize = 16;
  const scale = 2;
  const lw = 5 * scale;
  const lh = 7 * scale;
  const offX = Math.floor((gridSize - lw) / 2);
  const offY = Math.floor((gridSize - lh) / 2);
  const color = pickBlueBiased(makeRng(makeSeed('?')));
  const pills: Pill[] = [];

  for (let row = 0; row < 7; row++) {
    for (let col = 0; col < 5; col++) {
      if (letterData[row][col] === '1') {
        for (let sy = 0; sy < scale; sy++) {
          for (let sx = 0; sx < scale; sx++) {
            pills.push({ x: offX + col * scale + sx, y: offY + row * scale + sy, color });
          }
        }
      }
    }
  }

  return renderPillsToSvg(pills, gridSize, gridSize, 14, 0.38);
}
