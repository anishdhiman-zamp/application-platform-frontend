export const SENTRY_DSN =
  'https://3129cf83b7bf9bd6c715ba81823cd0db@o4504767438520320.ingest.us.sentry.io/4508794285129728';

export enum ENVIRONMENT_TYPES {
  PRODUCTION = 'production',
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  LOCAL = 'local',
}

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

export const ORG_COLORS = ['bg-red-200', 'bg-orange-200', 'bg-green-300', 'bg-blue-300', 'bg-blue-200'];

export enum STORAGE_TYPES {
  SESSION = 'session',
  LOCAL = 'local',
}

export const SCREEN_BREAKPOINTS = {
  MIN_WIDTH: 854,
  MIN_HEIGHT: 300,
  XL_WIDTH: 1280,
  LG_WIDTH: 1024,
};

export enum POLLING_STATUS {
  SUCCESSFUL = 'SUCCESSFUL',
  FAILED = 'FAILED',
  INITIATED = 'INITIATED',
}

export const DEFAULT_SHEET_NAME = 'Untitled Sheet';
export const DEFAULT_SHEET_DESCRIPTION = 'Untitled description';
export const DEFAULT_PAGE_NAME = 'New page';
export const DEFAULT_PAGE_DESCRIPTION = 'New page description';

export enum DEVICE_TYPES {
  MOBILE = 'mobile',
  TABLET = 'tablet',
}

export const enum LOCAL_DEVELOPMENT_URLS {
  LOCAL = 'local.zamp.ai',
  CODER = 'coder.dev-mum.internal.zamp.dev',
}
