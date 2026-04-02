export { KEYBOARD_KEYS } from './keyboardKeys';

export const safeJsonParse = <T = Record<string, unknown>>(
  value: string | undefined | null,
  fallback: T = {} as T,
): T => {
  try {
    return JSON.parse(value || '{}');
  } catch {
    return fallback;
  }
};
