export const COLORS = {
  GRAY_50: '#A6A6A61A',
  GRAY_100: '#F2F2F2',
  GRAY_500: '#C9C9C9',
  GRAY_400: '#EBEBEB',
  GRAY_450: '#C0C0C0',
  GRAY_600: '#A8A8A8',
  GRAY_700: '#8F8F8F',
  GRAY_800: '#7D7D7D',
  GRAY_900: '#666666',
  GRAY_950: '#383838',
  GRAY_1000: '#171717',
  BACKGROUND_GRAY_1: '#FBFBFB',
  BACKGROUND_GRAY_2: '#FAFAFA',
  RED_100: '#FFE6E6',
  RED_200: '#FFDADA',
  RED_300: '#D25656',
  RED_700: '#FF1515',
  RED_800: '#E10909',
  RED_900: '#A40000',
  ORANGE_600: '#FF8F0E',
  ORANGE_300: '#ED6704',
  ORANGE_200: '#FCEDB9',
  ORANGE_400: '#FCD579',
  GRAY_300: '#A1A1A1',
  BLUE_150: '#DFF0FF',
  BLUE_100: '#EAF3FF',
  BLUE_200: '#DFEBFF',
  BLUE_500: '#92BDFB',
  BLUE_700: '#2546F5',
  GREEN_100: '#D0E8CF',
  GREEN_300: '#038408',
  GREEN_400: '#5FE573',
  GREEN_700: '#0DA425',
  GREEN_1: '#48a885',
  GREEN_2: '#e2f1eb',
  PURPLE_1: '#df92fb',
  PURPLE_2: '#f4daff',
  VIOLET_1: '#e3e5fb',

  // dark mode equivalents for team chip colors (used by TEAMS_DARK_COLORS / resolveChipColor):
  VIOLET_1_DARK: '#2A1548',
  BLUE_150_DARK: '#190955',
  ORANGE_200_DARK: '#461902',
  GREEN_100_DARK: '#02300B',
  RED_100_DARK: '#510404',

  // ignore colors :
  ZAMP_SECONDARY: '#EEF1FF',
  GREEN_SECONDARY: '#21BF86',
  RED_SECONDARY: '#D64141',
  DIVIDER_SAIL_2: '#E9E9E0',

  // extra colors :
  BLACK: '#000000',
  WHITE: '#FFFFFF',
  TRANSPARENT: '#00000000',
  TEXT_PRIMARY: '#171717',
  TEXT_SECONDARY: '#666666',
  TEXT_TERTIARY: '#8F8F8F',
  DIVIDER_GRAY: '#EBEBEB',
};

/**
 * CSS variable references for colors that auto-switch between light and dark mode.
 * Use these for inline styles instead of COLORS hex values — no useTheme hook needed.
 * The browser resolves the correct hex at render time based on the active theme class.
 */
export const CSS_VARS = {
  // gray
  GRAY_20: 'var(--GRAY_20)',
  GRAY_50: 'var(--GRAY_50)',
  GRAY_70: 'var(--GRAY_70)',
  GRAY_100: 'var(--GRAY_100)',
  GRAY_200: 'var(--GRAY_200)',
  GRAY_300: 'var(--GRAY_300)',
  GRAY_400: 'var(--GRAY_400)',
  GRAY_500: 'var(--GRAY_500)',
  GRAY_600: 'var(--GRAY_600)',
  GRAY_700: 'var(--GRAY_700)',
  GRAY_800: 'var(--GRAY_800)',
  GRAY_900: 'var(--GRAY_900)',
  GRAY_950: 'var(--GRAY_950)',
  GRAY_1000: 'var(--GRAY_1000)',
  // backgrounds
  BG_WHITE: 'var(--BG_WHITE)',
  BG_GRAY_1: 'var(--BG_GRAY_1)',
  BG_GRAY_2: 'var(--BG_GRAY_2)',
  // blue
  BLUE_100: 'var(--BLUE_100)',
  BLUE_200: 'var(--BLUE_200)',
  BLUE_300: 'var(--BLUE_300)',
  BLUE_400: 'var(--BLUE_400)',
  BLUE_500: 'var(--BLUE_500)',
  BLUE_600: 'var(--BLUE_600)',
  BLUE_700: 'var(--BLUE_700)',
  BLUE_800: 'var(--BLUE_800)',
  BLUE_900: 'var(--BLUE_900)',
  BLUE_1000: 'var(--BLUE_1000)',
  // green
  GREEN_100: 'var(--GREEN_100)',
  GREEN_200: 'var(--GREEN_200)',
  GREEN_300: 'var(--GREEN_300)',
  GREEN_400: 'var(--GREEN_400)',
  GREEN_500: 'var(--GREEN_500)',
  GREEN_600: 'var(--GREEN_600)',
  GREEN_700: 'var(--GREEN_700)',
  GREEN_800: 'var(--GREEN_800)',
  GREEN_900: 'var(--GREEN_900)',
  GREEN_1000: 'var(--GREEN_1000)',
  // orange
  ORANGE_100: 'var(--ORANGE_100)',
  ORANGE_200: 'var(--ORANGE_200)',
  ORANGE_300: 'var(--ORANGE_300)',
  ORANGE_400: 'var(--ORANGE_400)',
  ORANGE_500: 'var(--ORANGE_500)',
  ORANGE_600: 'var(--ORANGE_600)',
  ORANGE_700: 'var(--ORANGE_700)',
  ORANGE_800: 'var(--ORANGE_800)',
  ORANGE_900: 'var(--ORANGE_900)',
  ORANGE_1000: 'var(--ORANGE_1000)',
  // red
  RED_100: 'var(--RED_100)',
  RED_200: 'var(--RED_200)',
  RED_300: 'var(--RED_300)',
  RED_400: 'var(--RED_400)',
  RED_500: 'var(--RED_500)',
  RED_600: 'var(--RED_600)',
  RED_700: 'var(--RED_700)',
  RED_800: 'var(--RED_800)',
  RED_900: 'var(--RED_900)',
  RED_950: 'var(--RED_950)',
  RED_1000: 'var(--RED_1000)',
  // custom
  GREEN_1: 'var(--GREEN_1)',
  GREEN_2: 'var(--GREEN_2)',
  PURPLE_1: 'var(--PURPLE_1)',
  PURPLE_2: 'var(--PURPLE_2)',
  VIOLET_1: 'var(--VIOLET_1)',
  VIOLET_100: 'var(--VIOLET_100)',
} as const;

export const CHART_PALETTE_COLORS = [
  '#4F7980',
  '#5683D2',
  '#C0A2EE',
  '#66B06A',
  '#DEB1B9',
  '#694162',
  '#B2C8EB',
  '#E8E8E8',
];

export const CHART_PALETTE = {
  palette: {
    fills: CHART_PALETTE_COLORS,
    strokes: ['gray'],
  },
};

export const CHIP_COLORS: string[] = [
  COLORS.ORANGE_200,
  COLORS.GREEN_100,
  COLORS.VIOLET_1,
  COLORS.BLUE_150,
  COLORS.RED_200,
];

export const TEAMS_COLORS: string[] = [
  COLORS.VIOLET_1,
  COLORS.BLUE_150,
  COLORS.ORANGE_200,
  COLORS.GREEN_100,
  COLORS.RED_100,
];

export const TEAMS_DARK_COLORS: string[] = [
  COLORS.VIOLET_1_DARK,
  COLORS.BLUE_150_DARK,
  COLORS.ORANGE_200_DARK,
  COLORS.GREEN_100_DARK,
  COLORS.RED_100_DARK,
];

// extra colors :
export const CUSTOM_FILTER_COLORS: string[] = [
  '#4F7980',
  '#5683D2',
  '#C0A2EE',
  '#66B06A',
  '#DEB1B9',
  '#694162',
  '#B2C8EB',
  '#C8D882',
];
