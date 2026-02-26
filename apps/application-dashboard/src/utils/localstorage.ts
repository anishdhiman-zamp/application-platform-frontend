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
  COLUMN_ORDERING_VISIBILITY = 'COLUMNS_ORDER_VISIBILITY',
  XZAMP_ORGANIZATION_ID = 'X-Zamp-Organization-Id',
  OPEN_LOG_GROUP_IDS = 'OPEN_LOG_GROUP_IDS',
  DATASET_COMPLETED_FIELDS = 'DATASET_COMPLETED_FIELDS',
  WIDGET_CREATION_FORM_DATA = 'WIDGET_CREATION_FORM_DATA',
  LAST_VISITED_SHEET_ID = 'LAST_VISITED_SHEET_ID',
  CREATE_EDIT_FILTER_FORM_DATA = 'CREATE_EDIT_FILTER_FORM_DATA',
  COMBINED_TRIGGERS = 'COMBINED_TRIGGERS',
  MAPPED_INTEGRATIONS_LIST = 'MAPPED_INTEGRATIONS_LIST',
  CONVERSATION_DRAFTS = 'CONVERSATION_DRAFTS',
  PACE_OPEN_DYNAMIC_TABS = 'PACE_OPEN_DYNAMIC_TABS',
  PACE_FILE_TREE_EXPANDED_PATHS = 'PACE_FILE_TREE_EXPANDED_PATHS',
}

export const getFromLocalStorage = (key: LOCAL_STORAGE_KEYS) => {
  if (typeof window === 'undefined') {
    return '';
  }

  return window?.localStorage?.getItem(key);
};

export const setToLocalStorage = (key: LOCAL_STORAGE_KEYS, value: string) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(key, value);
};

export const removeFromLocalStorage = (key: LOCAL_STORAGE_KEYS) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(key);
};

export const getStoredExpandedPaths = (): string[] => {
  try {
    const stored = getFromLocalStorage(LOCAL_STORAGE_KEYS.PACE_FILE_TREE_EXPANDED_PATHS);

    if (!stored) return [];

    return JSON.parse(stored) as string[];
  } catch {
    return [];
  }
};

export const setStoredExpandedPaths = (paths: string[]) => {
  try {
    setToLocalStorage(LOCAL_STORAGE_KEYS.PACE_FILE_TREE_EXPANDED_PATHS, JSON.stringify(paths));
  } catch {
    // silent error
  }
};
