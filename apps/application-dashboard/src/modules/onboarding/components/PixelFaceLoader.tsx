'use client';

import { useEffect, useState } from 'react';
import { ZAMP_COLORS } from '@/modules/onboarding/utils/avatarGenerator';

// 14-col grid matching BASE_HEAD from avatarGenerator.
// 0=empty, S=skin, H=hair, E=eye, M=mouth, B=blush
type CellType = '.' | 'S' | 'H' | 'E' | 'M' | 'B';
type Frame = CellType[][];

// Use ZAMP_COLORS for palette consistency with seed avatars
const SKIN = ZAMP_COLORS[0]; // #C5C5B5 - light gray
const HAIR = ZAMP_COLORS[1]; // #3B673B - green
const EYE = ZAMP_COLORS[5]; // #005eff - blue
const MOUTH = ZAMP_COLORS[3]; // #682C4B - mauve
const BLUSH = ZAMP_COLORS[4]; // #D0DDA3 - light green

const COLOR_MAP: Record<CellType, string | null> = {
  '.': null,
  S: SKIN,
  H: HAIR,
  E: EYE,
  M: MOUTH,
  B: BLUSH,
};

// prettier-ignore
const frames: Frame[] = [
  // 0: Neutral
  [
    ['.','.','.','.','H','H','H','H','H','H','.','.','.','.'],
    ['.','.','H','H','H','H','H','H','H','H','H','H','.','.'],
    ['.','H','H','H','H','H','H','H','H','H','H','H','H','.'],
    ['.','H','H','S','S','S','S','S','S','S','S','H','H','.'],
    ['S','S','S','S','S','S','S','S','S','S','S','S','S','S'],
    ['S','S','S','S','E','E','S','S','E','E','S','S','S','S'],
    ['S','S','S','S','E','E','S','S','E','E','S','S','S','S'],
    ['S','S','S','S','S','S','S','S','S','S','S','S','S','S'],
    ['S','S','S','S','S','S','S','S','S','S','S','S','S','S'],
    ['.','S','S','S','S','M','M','M','M','S','S','S','S','.'],
    ['.','S','S','S','S','S','S','S','S','S','S','S','S','.'],
    ['.','.','S','S','S','S','S','S','S','S','S','S','.','.'],
    ['.','.','.','.','S','S','S','S','S','S','.','.','.','.'],
  ],
  // 1: Blink
  [
    ['.','.','.','.','H','H','H','H','H','H','.','.','.','.'],
    ['.','.','H','H','H','H','H','H','H','H','H','H','.','.'],
    ['.','H','H','H','H','H','H','H','H','H','H','H','H','.'],
    ['.','H','H','S','S','S','S','S','S','S','S','H','H','.'],
    ['S','S','S','S','S','S','S','S','S','S','S','S','S','S'],
    ['S','S','S','S','S','S','S','S','S','S','S','S','S','S'],
    ['S','S','S','S','E','E','S','S','E','E','S','S','S','S'],
    ['S','S','S','S','S','S','S','S','S','S','S','S','S','S'],
    ['S','S','S','S','S','S','S','S','S','S','S','S','S','S'],
    ['.','S','S','S','S','M','M','M','M','S','S','S','S','.'],
    ['.','S','S','S','S','S','S','S','S','S','S','S','S','.'],
    ['.','.','S','S','S','S','S','S','S','S','S','S','.','.'],
    ['.','.','.','.','S','S','S','S','S','S','.','.','.','.'],
  ],
  // 2: Happy
  [
    ['.','.','.','.','H','H','H','H','H','H','.','.','.','.'],
    ['.','.','H','H','H','H','H','H','H','H','H','H','.','.'],
    ['.','H','H','H','H','H','H','H','H','H','H','H','H','.'],
    ['.','H','H','S','S','S','S','S','S','S','S','H','H','.'],
    ['S','S','S','S','S','S','S','S','S','S','S','S','S','S'],
    ['S','S','S','S','E','E','S','S','E','E','S','S','S','S'],
    ['S','S','S','S','E','E','S','S','E','E','S','S','S','S'],
    ['S','S','S','S','S','S','S','S','S','S','S','S','S','S'],
    ['S','S','B','S','S','S','S','S','S','S','S','B','S','S'],
    ['.','S','S','S','M','S','S','S','S','M','S','S','S','.'],
    ['.','S','S','S','S','M','M','M','M','S','S','S','S','.'],
    ['.','.','S','S','S','S','S','S','S','S','S','S','.','.'],
    ['.','.','.','.','S','S','S','S','S','S','.','.','.','.'],
  ],
  // 3: Look right
  [
    ['.','.','.','.','H','H','H','H','H','H','.','.','.','.'],
    ['.','.','H','H','H','H','H','H','H','H','H','H','.','.'],
    ['.','H','H','H','H','H','H','H','H','H','H','H','H','.'],
    ['.','H','H','S','S','S','S','S','S','S','S','H','H','.'],
    ['S','S','S','S','S','S','S','S','S','S','S','S','S','S'],
    ['S','S','S','S','S','E','E','S','S','E','E','S','S','S'],
    ['S','S','S','S','S','E','E','S','S','E','E','S','S','S'],
    ['S','S','S','S','S','S','S','S','S','S','S','S','S','S'],
    ['S','S','S','S','S','S','S','S','S','S','S','S','S','S'],
    ['.','S','S','S','S','S','M','M','S','S','S','S','S','.'],
    ['.','S','S','S','S','S','S','S','S','S','S','S','S','.'],
    ['.','.','S','S','S','S','S','S','S','S','S','S','.','.'],
    ['.','.','.','.','S','S','S','S','S','S','.','.','.','.'],
  ],
  // 4: Look left
  [
    ['.','.','.','.','H','H','H','H','H','H','.','.','.','.'],
    ['.','.','H','H','H','H','H','H','H','H','H','H','.','.'],
    ['.','H','H','H','H','H','H','H','H','H','H','H','H','.'],
    ['.','H','H','S','S','S','S','S','S','S','S','H','H','.'],
    ['S','S','S','S','S','S','S','S','S','S','S','S','S','S'],
    ['S','S','S','E','E','S','S','E','E','S','S','S','S','S'],
    ['S','S','S','E','E','S','S','E','E','S','S','S','S','S'],
    ['S','S','S','S','S','S','S','S','S','S','S','S','S','S'],
    ['S','S','S','S','S','S','S','S','S','S','S','S','S','S'],
    ['.','S','S','S','S','S','M','M','S','S','S','S','S','.'],
    ['.','S','S','S','S','S','S','S','S','S','S','S','S','.'],
    ['.','.','S','S','S','S','S','S','S','S','S','S','.','.'],
    ['.','.','.','.','S','S','S','S','S','S','.','.','.','.'],
  ],
  // 5: Surprised
  [
    ['.','.','.','.','H','H','H','H','H','H','.','.','.','.'],
    ['.','.','H','H','H','H','H','H','H','H','H','H','.','.'],
    ['.','H','H','H','H','H','H','H','H','H','H','H','H','.'],
    ['.','H','H','S','S','S','S','S','S','S','S','H','H','.'],
    ['S','S','S','S','S','S','S','S','S','S','S','S','S','S'],
    ['S','S','S','E','E','E','S','S','E','E','E','S','S','S'],
    ['S','S','S','E','E','E','S','S','E','E','E','S','S','S'],
    ['S','S','S','S','S','S','S','S','S','S','S','S','S','S'],
    ['S','S','S','S','S','S','S','S','S','S','S','S','S','S'],
    ['.','S','S','S','S','S','M','M','S','S','S','S','S','.'],
    ['.','S','S','S','S','S','M','M','S','S','S','S','S','.'],
    ['.','.','S','S','S','S','S','S','S','S','S','S','.','.'],
    ['.','.','.','.','S','S','S','S','S','S','.','.','.','.'],
  ],
  // 6: Wink
  [
    ['.','.','.','.','H','H','H','H','H','H','.','.','.','.'],
    ['.','.','H','H','H','H','H','H','H','H','H','H','.','.'],
    ['.','H','H','H','H','H','H','H','H','H','H','H','H','.'],
    ['.','H','H','S','S','S','S','S','S','S','S','H','H','.'],
    ['S','S','S','S','S','S','S','S','S','S','S','S','S','S'],
    ['S','S','S','S','E','E','S','S','S','S','S','S','S','S'],
    ['S','S','S','S','E','E','S','S','E','E','E','S','S','S'],
    ['S','S','S','S','S','S','S','S','S','S','S','S','S','S'],
    ['S','S','B','S','S','S','S','S','S','S','S','B','S','S'],
    ['.','S','S','S','S','M','M','M','M','S','S','S','S','.'],
    ['.','S','S','S','S','S','S','S','S','S','S','S','S','.'],
    ['.','.','S','S','S','S','S','S','S','S','S','S','.','.'],
    ['.','.','.','.','S','S','S','S','S','S','.','.','.','.'],
  ],
];

// Sequence with timing: [frameIndex, durationMs]
const SEQUENCE: [number, number][] = [
  [0, 1500], // neutral
  [1, 200], // blink
  [0, 800], // neutral
  [3, 1000], // look right
  [4, 1000], // look left
  [0, 600], // neutral
  [1, 200], // blink
  [2, 1800], // happy
  [5, 1200], // surprised
  [1, 200], // blink
  [6, 1500], // wink
  [0, 1000], // neutral
];

// Match avatarGenerator proportions: pill=88%, rx=28%
const CELL_SIZE = 6;
const PW = CELL_SIZE * 0.88;
const RX = PW * 0.28;
const COLS = 14;
const ROWS = 13;
const WIDTH = COLS * CELL_SIZE;
const HEIGHT = ROWS * CELL_SIZE;

export const PixelFaceLoader = () => {
  const [seqIndex, setSeqIndex] = useState(0);

  useEffect(() => {
    const [, duration] = SEQUENCE[seqIndex];

    const timeout = setTimeout(() => {
      setSeqIndex((prev) => (prev + 1) % SEQUENCE.length);
    }, duration);

    return () => clearTimeout(timeout);
  }, [seqIndex]);

  const frameIndex = SEQUENCE[seqIndex][0];
  const frame = frames[frameIndex];

  return (
    <svg
      width={WIDTH}
      height={HEIGHT}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      xmlns='http://www.w3.org/2000/svg'
      role='img'
      aria-label='Loading animation'
    >
      {frame.map((row, y) =>
        row.map((cell, x) => {
          const color = COLOR_MAP[cell];

          if (!color) return null;

          const cx = x * CELL_SIZE + CELL_SIZE / 2;
          const cy = y * CELL_SIZE + CELL_SIZE / 2;

          return (
            <rect
              key={`${x}-${y}`}
              x={cx - PW / 2}
              y={cy - PW / 2}
              width={PW}
              height={PW}
              rx={RX}
              ry={RX}
              fill={color}
            />
          );
        }),
      )}
    </svg>
  );
};
