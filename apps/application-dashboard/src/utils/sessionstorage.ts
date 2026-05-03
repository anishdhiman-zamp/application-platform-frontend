import { isBrowser } from '@zamp-platform/utils';

export enum SESSION_STORAGE_KEYS {
  PATHNAME_PRE_LOGOUT = 'PATHNAME_PRE_LOGOUT',
  PACE_SETTINGS_LAST_TAB = 'PACE_SETTINGS_LAST_TAB',
  PACE_OPEN_DYNAMIC_TABS_BY_CONVERSATION = 'PACE_OPEN_DYNAMIC_TABS_BY_CONVERSATION_V1',
}

export const getFromSessionStorage = (key: SESSION_STORAGE_KEYS) => {
  if (!isBrowser()) {
    return null;
  }

  return sessionStorage.getItem(key);
};

export const setToSessionStorage = (key: SESSION_STORAGE_KEYS, value: string) => {
  if (!isBrowser()) {
    return;
  }
  sessionStorage.setItem(key, value);
};

export const removeFromSessionStorage = (key: SESSION_STORAGE_KEYS) => {
  if (!isBrowser()) {
    return;
  }
  sessionStorage.removeItem(key);
};
