import { isBrowser } from '../browser';

export enum LOCAL_STORAGE_KEYS {
  XZAMP_GOD_MODE = 'XZAMP_GOD_MODE',
  XZAMP_USER = 'TMS_XZAMP_USER',
  XZAMP_WORKSPACE_ID = 'XZAMP_WORKSPACE_ID',
  DATE_PLACEHOLDER_SEEN = 'DATE_PLACEHOLDER_SEEN',
  DATA_SHEET_ID = 'DATA_SHEET_ID',
  WIDGET_INSTANCE_ID = 'WIDGET_INSTANCE_ID',
  LAST_LOGGED_IN_OIDC_EMAIL = 'LAST_LOGGED_IN_OIDC_EMAIL',
  LAST_VISITED_PAGE_ID = 'LAST_VISITED_PAGE_ID',
  COLUMN_ORDERING_VISIBILITY = 'COLUMN_ORDER_VISIBILITY',
  XZAMP_ORGANIZATION_ID = 'X-Zamp-Organization-Id',
  ORG_REGION = 'ORG_REGION_V5',
  ALL_REGIONS = 'ALL_REGIONS_V4',
  PACE_OPEN_DYNAMIC_TABS = 'PACE_OPEN_DYNAMIC_TABS',
}

export const getFromLocalStorage = (key: string) => {
  if (!isBrowser()) {
    return '';
  }

  const value = localStorage.getItem(key);
  return value !== null ? value : '';
};

export const setToLocalStorage = (key: LOCAL_STORAGE_KEYS, value: string) => {
  if (!isBrowser()) {
    return;
  }
  localStorage.setItem(key, value);
};

export const removeFromLocalStorage = (key: LOCAL_STORAGE_KEYS) => {
  if (!isBrowser()) {
    return;
  }
  localStorage.removeItem(key);
};
