export enum LOCAL_STORAGE_KEYS {
  XZAMP_GOD_MODE = 'XZAMP_GOD_MODE',
  XZAMP_USER = 'TMS_XZAMP_USER',
  XZAMP_WORKSPACE_ID = 'XZAMP_WORKSPACE_ID',
  DATE_PLACEHOLDER_SEEN = 'DATE_PLACEHOLDER_SEEN',
  DATA_SHEET_ID = 'DATA_SHEET_ID',
  WIDGET_INSTANCE_ID = 'WIDGET_INSTANCE_ID',
  LAST_LOGGED_IN_OIDC_EMAIL = 'LAST_LOGGED_IN_OIDC_EMAIL',
  LAST_VISITED_PAGE_ID = 'LAST_VISITED_PAGE_ID',
  COLUMN_ORDERING_VISIBILITY = 'COLUMN_ORDERING_VISIBILITY',
  XZAMP_ORGANIZATION_ID = 'X-Zamp-Organization-Id',
  ORG_REGION = 'ORG_REGION_V2',
}

export const getFromLocalStorage = (key: string) => {
  if (typeof window === 'undefined') {
    return '';
  }

  return localStorage.getItem(key);
};

export const setToLocalStorage = (key: LOCAL_STORAGE_KEYS, value: string) => {
  localStorage.setItem(key, value);
};

export const removeFromLocalStorage = (key: LOCAL_STORAGE_KEYS) => {
  localStorage.removeItem(key);
};
