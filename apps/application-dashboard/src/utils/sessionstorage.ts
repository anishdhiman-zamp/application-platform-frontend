export enum SESSION_STORAGE_KEYS {
  PATHNAME_PRE_LOGOUT = 'PATHNAME_PRE_LOGOUT',
}

export const getFromSessionStorage = (key: SESSION_STORAGE_KEYS) => {
  return sessionStorage.getItem(key);
};

export const setToSessionStorage = (key: SESSION_STORAGE_KEYS, value: string) => {
  sessionStorage.setItem(key, value);
};

export const removeFromSessionStorage = (key: SESSION_STORAGE_KEYS) => {
  sessionStorage.removeItem(key);
};
