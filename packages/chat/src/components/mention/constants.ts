export const RECENT_TAB = 'recent';

export const MENTION_KIND = {
  FILE: 'file',
  DATASET: 'dataset',
} as const;

export const V1_KINDS = new Set<string>(Object.values(MENTION_KIND));
export const DEBOUNCE_MS = 300;
export const EXIT_ANIMATION_MS = 120;

export const TAB_BASE =
  'inline-flex h-6 items-center gap-1 rounded-[6px] border px-2.5 text-[12px] font-medium leading-none transition-colors';

export const TAB_STYLES = {
  'recent-active': 'border-GRAY_100 bg-GRAY_100 text-GRAY_1000',
  'recent-inactive': 'border-GRAY_100 bg-BG_WHITE text-GRAY_700 hover:bg-GRAY_100',
  'kind-active': 'border-GRAY_100 bg-GRAY_100 text-GRAY_1000',
  'kind-inactive': 'border-GRAY_100 bg-BG_WHITE text-GRAY_900 hover:bg-GRAY_100',
} as const;
