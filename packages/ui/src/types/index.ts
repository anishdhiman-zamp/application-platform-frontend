enum SIZE_TYPES {
  XLARGE = 'XLARGE',
  LARGE = 'LARGE',
  MEDIUM = 'MEDIUM',
  SMALL = 'SMALL',
  XSMALL = 'XSMALL',
  XXSMALL = 'XXSMALL',
}

enum POSITION_TYPES {
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
  BOTTOM = 'BOTTOM',
  TOP = 'TOP',
}

export { SIZE_TYPES, POSITION_TYPES };

// Export individual values to fix unused variables warning
export const { XLARGE, LARGE, MEDIUM, SMALL, XSMALL, XXSMALL } = SIZE_TYPES;

export const { LEFT, RIGHT, BOTTOM, TOP } = POSITION_TYPES;
