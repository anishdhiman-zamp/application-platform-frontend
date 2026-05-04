'use client';

import type { CSSProperties } from 'react';
import { type LegacyAnimationControls, motion, type Variants } from 'motion/react';

export type ZampLogoAnimationType =
  | 'rest'
  | 'fromTop'
  | 'fromBottom'
  | 'fromLeft'
  | 'fromRight'
  | 'split'
  | 'merge'
  | 'flip';

export const ZAMP_LOGO_PLAYABLE_ANIMATIONS: Exclude<ZampLogoAnimationType, 'rest'>[] = [
  'fromTop',
  'fromBottom',
  'fromLeft',
  'fromRight',
  'split',
  'merge',
  'flip',
];

interface ZampLogoProps {
  size?: number;
  color?: string;
  className?: string;
  controls?: LegacyAnimationControls;
}

const SWAP_DURATION = 0.55;
const SWAP_TIMES_LEAD = [0, 0.45, 1];
const SWAP_TIMES_FOLLOW = [0, 0.55, 1];
const SWAP_EASE: [number, number, number, number] = [0.5, 0, 0.4, 1];

const SKEW_DURATION = 0.55;
const SKEW_TIMES_LEAD = [0, 0.4, 1];
const SKEW_TIMES_FOLLOW = [0, 0.55, 1];
const SKEW_EASE: [number, number, number, number] = [0.4, 0, 0.4, 1];
const SKEW_PEAK = 14;

const DEPTH_DURATION = 0.55;
const DEPTH_TIMES = [0, 0.5, 1];
const DEPTH_EASE: [number, number, number, number] = [0.4, 0, 0.4, 1];
const ROTATE_X_PEAK = 14;
const ROTATE_Y_PEAK = 18;

const SEPARATE_DURATION = 0.55;
const SEPARATE_TIMES = [0, 0.45, 1];
const SEPARATE_EASE: [number, number, number, number] = [0.5, 0, 0.4, 1];
const SPLIT_PEAK = 50;
const MERGE_PEAK = 33;

const FLIP_DURATION = 0.7;
const FLIP_EASE: [number, number, number, number] = [0.45, 0, 0.55, 1];

const PATH_STYLE: CSSProperties = { transformBox: 'fill-box', transformOrigin: 'center' };

export const ZAMP_LOGO_TOP_VARIANTS: Variants = {
  rest: { y: '0%', x: '0%', skewX: 0 },

  fromTop: {
    y: ['0%', '60%', '133%'],
    skewX: 0,
    transition: { duration: SWAP_DURATION, times: SWAP_TIMES_LEAD, ease: SWAP_EASE },
  },

  fromBottom: {
    y: ['0%', '5%', '133%'],
    skewX: 0,
    transition: { duration: SWAP_DURATION, times: SWAP_TIMES_FOLLOW, ease: SWAP_EASE },
  },

  fromLeft: {
    skewX: [0, -SKEW_PEAK, 0],
    y: '0%',
    transition: { duration: SKEW_DURATION, times: SKEW_TIMES_LEAD, ease: SKEW_EASE },
  },

  fromRight: {
    skewX: [0, SKEW_PEAK, 0],
    y: '0%',
    transition: { duration: SKEW_DURATION, times: SKEW_TIMES_FOLLOW, ease: SKEW_EASE },
  },

  split: {
    y: ['0%', `-${SPLIT_PEAK}%`, '0%'],
    skewX: 0,
    transition: { duration: SEPARATE_DURATION, times: SEPARATE_TIMES, ease: SEPARATE_EASE },
  },

  merge: {
    y: ['0%', `${MERGE_PEAK}%`, '0%'],
    skewX: 0,
    transition: { duration: SEPARATE_DURATION, times: SEPARATE_TIMES, ease: SEPARATE_EASE },
  },

  flip: { y: '0%', skewX: 0 },
};

export const ZAMP_LOGO_BOTTOM_VARIANTS: Variants = {
  rest: { y: '0%', x: '0%', skewX: 0 },

  fromTop: {
    y: ['0%', '-5%', '-133%'],
    skewX: 0,
    transition: { duration: SWAP_DURATION, times: SWAP_TIMES_FOLLOW, ease: SWAP_EASE },
  },

  fromBottom: {
    y: ['0%', '-60%', '-133%'],
    skewX: 0,
    transition: { duration: SWAP_DURATION, times: SWAP_TIMES_LEAD, ease: SWAP_EASE },
  },

  fromLeft: {
    skewX: [0, -SKEW_PEAK, 0],
    y: '0%',
    transition: { duration: SKEW_DURATION, times: SKEW_TIMES_FOLLOW, ease: SKEW_EASE },
  },

  fromRight: {
    skewX: [0, SKEW_PEAK, 0],
    y: '0%',
    transition: { duration: SKEW_DURATION, times: SKEW_TIMES_LEAD, ease: SKEW_EASE },
  },

  split: {
    y: ['0%', `${SPLIT_PEAK}%`, '0%'],
    skewX: 0,
    transition: { duration: SEPARATE_DURATION, times: SEPARATE_TIMES, ease: SEPARATE_EASE },
  },

  merge: {
    y: ['0%', `-${MERGE_PEAK}%`, '0%'],
    skewX: 0,
    transition: { duration: SEPARATE_DURATION, times: SEPARATE_TIMES, ease: SEPARATE_EASE },
  },

  flip: { y: '0%', skewX: 0 },
};

export const ZAMP_LOGO_WRAPPER_VARIANTS: Variants = {
  rest: { rotateX: 0, rotateY: 0 },

  fromTop: {
    rotateX: [0, ROTATE_X_PEAK, 0],
    rotateY: 0,
    transition: { duration: DEPTH_DURATION, times: DEPTH_TIMES, ease: DEPTH_EASE },
  },

  fromBottom: {
    rotateX: [0, -ROTATE_X_PEAK, 0],
    rotateY: 0,
    transition: { duration: DEPTH_DURATION, times: DEPTH_TIMES, ease: DEPTH_EASE },
  },

  fromLeft: {
    rotateY: [0, -ROTATE_Y_PEAK, 0],
    rotateX: 0,
    transition: { duration: DEPTH_DURATION, times: DEPTH_TIMES, ease: DEPTH_EASE },
  },

  fromRight: {
    rotateY: [0, ROTATE_Y_PEAK, 0],
    rotateX: 0,
    transition: { duration: DEPTH_DURATION, times: DEPTH_TIMES, ease: DEPTH_EASE },
  },

  split: { rotateX: 0, rotateY: 0 },

  merge: { rotateX: 0, rotateY: 0 },

  flip: {
    rotateY: [0, 360],
    rotateX: 0,
    transition: { duration: FLIP_DURATION, ease: FLIP_EASE },
  },
};

const ZampLogo = ({ size = 24, color = 'currentColor', className, controls }: ZampLogoProps) => (
  <svg
    height={size}
    width={size}
    viewBox='0 0 66 53'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    className={className}
  >
    <motion.path
      d='M0 22.6284L12.4286 0H65.9408L53.5121 22.6284H0Z'
      fill={color}
      variants={ZAMP_LOGO_TOP_VARIANTS}
      animate={controls ?? 'rest'}
      initial='rest'
      style={PATH_STYLE}
    />
    <motion.path
      d='M0 52.7057L12.4286 30.0752H65.9408L53.5121 52.7057H0Z'
      fill={color}
      variants={ZAMP_LOGO_BOTTOM_VARIANTS}
      animate={controls ?? 'rest'}
      initial='rest'
      style={PATH_STYLE}
    />
  </svg>
);

export default ZampLogo;
