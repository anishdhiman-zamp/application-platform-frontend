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
export const ZAMP_LOADER = IMAGE_PREFIX + '/images/zamp-loader.gif';
export const WIDGET_LOADER_2 = IMAGE_PREFIX + '/images/widget-loader-2.gif';
export const JOINED_DATASET_ICON = IMAGE_PREFIX + '/icons/joined-dataset.svg';
export const ZAMP_LOGIN_BG = IMAGE_PREFIX + '/mp4/zamp-login-bg.mp4';
export const ZAMP_FULL_LOGO = IMAGE_PREFIX + '/icons/zamp-full-logo.svg';
export const COINS_STACKED_05 = IMAGE_PREFIX + '/icons/coins-stacked-05.svg';
export const PIVOT_HEADER_BG = IMAGE_PREFIX + '/images/pivot-header-bg.svg';
export const ARROW_RIGHT = IMAGE_PREFIX + '/icons/arrow-right.svg';
export const CHEVRON_DOWN = IMAGE_PREFIX + '/icons/chevron-down.svg';
export const CHEVRON_RIGHT = IMAGE_PREFIX + '/icons/chevron-right.svg';
export const DISABLED_CHEVRON_RIGHT = IMAGE_PREFIX + '/icons/disabled-chevron-right.svg';
export const RED_ALERT_ICON = IMAGE_PREFIX + '/icons/red-alert-circle.svg';
export const GREEN_CHECK_ICON = IMAGE_PREFIX + '/icons/green-check-circle.svg';
export const ZAMP_LOGO = IMAGE_PREFIX + '/icons/zampBlack.svg';
export const SCREEN_SUPPORT = IMAGE_PREFIX + '/images/screen-support.svg';

export const ADYEN = IMAGE_PREFIX + '/icons/bank-icons/adyen.png';
export const CHECKOUT = IMAGE_PREFIX + '/icons/bank-icons/checkout.svg';
export const DEFAULT_BANK = IMAGE_PREFIX + '/icons/bank-icons/default-bank.svg';
export const OTHER_GATEWAY = IMAGE_PREFIX + '/icons/bank-icons/other-gateway.svg';
export const DATASET_ICON = IMAGE_PREFIX + '/icons/dataset.svg';

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
