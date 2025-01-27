export enum SIZE {
  XSMALL = 'xsmall',
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
  XLARGE = 'xlarge',
}

export enum BUTTON_TYPE {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  TERTIARY = 'tertiary',
  ICON = 'icon',
  DESTRUCTIVE_HC = 'destructive-hc',
  DESTRUCTIVE_LC = 'destructive-lc',
  LINK = 'link',
}

export enum POSITION {
  LEFT = 'left',
  RIGHT = 'right',
  TOP = 'top',
  BOTTOM = 'bottom',
}

export const ALLOWED_EMAIL_DOMAINS = ['zamp.ai', 'zamp.finance'];
export const ENVIRONMENT = process.env.NEXT_PUBLIC_ENVIRONMENT || 'production';

export enum STORAGE_TYPES {
  SESSION = 'session',
  LOCAL = 'local',
}
