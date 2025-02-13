export const ASSET_PREFIX = process.env.NEXT_PUBLIC_ASSET_PREFIX ?? '';
const IMAGE_PREFIX = ASSET_PREFIX ? `${ASSET_PREFIX}/public` : '';

export const ZAMP_ICON = IMAGE_PREFIX + '/icons/zamp-icon.svg';
export const FAVICON = IMAGE_PREFIX + '/icons/favicon.png';
export const NOTEBOOK_ICON = IMAGE_PREFIX + '/icons/notebook.svg';
export const ZAMP_ICON_BLACK = IMAGE_PREFIX + '/icons/zamp-icon-black.svg';
export const GOOGLE_ICON = IMAGE_PREFIX + '/icons/google.svg';
export const DRAG_ICON = IMAGE_PREFIX + '/icons/drag-icon.svg';
export const ERROR_WITH_BORDER = IMAGE_PREFIX + '/icons/error-with-border.svg';
export const RULE_ICON = IMAGE_PREFIX + '/icons/rule.svg';
export const WIDGET_LOADER = IMAGE_PREFIX + '/images/widget-loader.gif';
export const WIDGET_LOADER_1 = IMAGE_PREFIX + '/images/widget-loader-1.gif';
export const WIDGET_LOADER_2 = IMAGE_PREFIX + '/images/widget-loader-2.gif';
export const JOINED_DATASET_ICON = IMAGE_PREFIX + '/icons/joined-dataset.svg';
export const ZAMP_LOGIN_BG = IMAGE_PREFIX + '/mp4/zamp-login-bg.mp4';
export const ZAMP_FULL_LOGO = IMAGE_PREFIX + '/icons/zamp-full-logo.svg';

export enum ICON_SPRITE_TYPES {
  ALERTS_AND_FEEDBACK = 'alerts-and-feedbacks',
  ARROWS = 'arrows',
  CHARTS = 'charts',
  COMMUNICATION = 'communication',
  COUNTRY_SET_1 = 'country-set-1',
  COUNTRY_SET_2 = 'country-set-2',
  CRYPTO_SET_1 = 'crypto-set-1',
  CRYPTO_SET_2 = 'crypto-set-2',
  CRYPTO_SET_3 = 'crypto-set-3',
  EDITOR = 'editor',
  EDUCATION = 'education',
  FILES = 'files',
  FINANCE_AND_ECOMMERCE = 'finance-and-ecommerce',
  GENERAL = 'general',
  LAYOUT = 'layout',
  SECURITY = 'security',
  TIME = 'time',
  USERS = 'users',
  COUNTRY_FLAGS = 'country-flags',
  FIAT_CURRENCIES = 'fiat-currencies',
  WEATHER = 'weather',
}

export enum SUPPORT_INFO_TYPES {
  GUIDE = 'GUIDE',
  ERROR = 'ERROR',
  CUSTOM = 'CUSTOM',
}
