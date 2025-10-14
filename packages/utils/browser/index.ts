/**
 * Check if code is running in a browser environment
 * @returns true if running in browser, false if running on server (SSR)
 */
export const isBrowser = (): boolean => {
  return typeof window !== 'undefined';
};
