export enum LOCAL_STORAGE_KEYS {
  XZAMP_GOD_MODE = 'XZAMP_GOD_MODE',
  XZAMP_USER = 'TMS_XZAMP_USER',
  XZAMP_WORKSPACE_ID = 'XZAMP_WORKSPACE_ID',
  DATE_PLACEHOLDER_SEEN = 'DATE_PLACEHOLDER_SEEN',
  DATA_SHEET_ID = 'DATA_SHEET_ID',
  WIDGET_INSTANCE_ID = 'WIDGET_INSTANCE_ID',
  LAST_LOGGED_IN_OIDC_EMAIL = 'LAST_LOGGED_IN_OIDC_EMAIL',
  LAST_VISITED_PAGE_ID = 'LAST_VISITED_PAGE_ID',
  LAST_VISITED_PROCESS_ID = 'LAST_VISITED_PROCESS_ID',
  COLUMN_ORDERING_VISIBILITY = 'COLUMN_ORDERING_VISIBILITY',
  XZAMP_ORGANIZATION_ID = 'X-Zamp-Organization-Id',
  OPEN_LOG_GROUP_IDS = 'OPEN_LOG_GROUP_IDS',
  COMPLETED_MISSING_FIELDS = 'COMPLETED_MISSING_FIELDS',
  WIDGET_CREATION_FORM_DATA = 'WIDGET_CREATION_FORM_DATA',
  LAST_VISITED_SHEET_ID = 'LAST_VISITED_SHEET_ID',
  CREATE_EDIT_FILTER_FORM_DATA = 'CREATE_EDIT_FILTER_FORM_DATA',
  CHAT_DRAFTS = 'CHAT_DRAFTS',
}

export const getFromLocalStorage = (key: string) => {
  if (typeof window === 'undefined') {
    return '';
  }

  return window?.localStorage?.getItem(key);
};

export const setToLocalStorage = (key: string, value: string) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(key, value);
};

export const removeFromLocalStorage = (key: string) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(key);
};
