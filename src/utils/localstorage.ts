export enum LOCAL_STORAGE_KEYS {
  XZAMP_GOD_MODE = 'XZAMP_GOD_MODE',
  XZAMP_USER = 'TMS_XZAMP_USER',
  XZAMP_WORKSPACE_ID = 'XZAMP_WORKSPACE_ID',
  DATE_PLACEHOLDER_SEEN = 'DATE_PLACEHOLDER_SEEN',
  DATA_SHEET_ID = 'DATA_SHEET_ID',
}

export const getFromLocalStorage = (key: string) => {
  return localStorage.getItem(key);
};

export const setToLocalStorage = (key: LOCAL_STORAGE_KEYS, value: string) => {
  localStorage.setItem(key, value);
};

export const removeFromLocalStorage = (key: LOCAL_STORAGE_KEYS) => {
  localStorage.removeItem(key);
};
