export const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME;
export const ENVIRONMENT = process.env.NEXT_PUBLIC_ENVIRONMENT;
export const DEV_API_URL = process.env.NEXT_PUBLIC_DEV_API_URL;
export const AZURE_CLIENT_ID = process.env.NEXT_PUBLIC_AZURE_CLIENT_ID ?? '';
export const AZURE_AUTHORITY = process.env.NEXT_PUBLIC_AZURE_AUTHORITY ?? '';
export const AZURE_REDIRECT = process.env.NEXT_PUBLIC_AZURE_REDIRECT || '/';
export const AZURE_SCOPE = process.env.NEXT_PUBLIC_AZURE_SCOPE ?? '';
export const VELT_KEY = process.env.NEXT_PUBLIC_VELT_KEY ?? '';
export const CSRF_TOKEN_KEY = 'X-ZAMP-CSRF';
export const PLATFORM_HEADER_KEY = 'X-Platform';
export const CANARY_HEADER_KEY = 'X-Canary';
export const REQUEST_TIMEOUT = 40000;
export const ABORT_ERROR = 'AbortError: signal is aborted without reason';
export const PLATFORM_TMS = 'TMS';
export const MULTI_REGION_ENABLED = process.env.NEXT_PUBLIC_MULTI_REGION_ENABLED === 'true';
export const LOGIN_PATH = '/login';
export const ORG_SWITCH_IN_PROGRESS_ERROR = 'Aborted due to org switch in progress';
export const CUSTOM_ERROR = 'CUSTOM_ERROR';

export const enum REQUEST_TYPES {
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
}

export const REGIONS_MAP = {
  us: {
    label: 'United States',
    suffix: '-us',
    shortHand: 'USA',
  },
  me: {
    label: 'Middle East',
    suffix: '-me',
    shortHand: 'ME',
  },
};

export const REGION_LIST = Object.values(REGIONS_MAP).map((region) => region.suffix);

export const ERROR_TOKENS = {
  INVALID_TOKEN: 'INVALID_TOKEN',
  FAILED_TO_INITIATE_LAUNCHDARKLY: 'FAILED_TO_INITIATE_LAUNCHDARKLY',
  MISSING_TOKEN: 'MISSING_TOKEN',
  PAGE_BREAK: 'PAGE_BREAK',
  PAGE_404: 'PAGE_404',
  NO_PERMISSIONS_PAGE: 'NO_PERMISSIONS_PAGE',
  USER_WITH_NO_PERMISSIONS: 'USER_WITH_NO_PERMISSIONS',
  CLIENT_INVALID_API_CALL: 'CLIENT_INVALID_API_CALL',
  CSV_PARSING_ERROR: 'CSV_PARSING_ERROR',
  CLIENT_SIDE_EXCEPTION: 'CLIENT_SIDE_EXCEPTION',
};

export const STATUS_CODE = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,

  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,

  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;

export const SESSION_EXPIRY_TOKENS = [ERROR_TOKENS.INVALID_TOKEN, ERROR_TOKENS.MISSING_TOKEN];
