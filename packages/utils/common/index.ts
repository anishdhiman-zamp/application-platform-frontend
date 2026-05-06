export { KEYBOARD_KEYS } from './keyboardKeys';

export type defaultFnType = () => void;
export type MapAny = Record<string, unknown>;
export const defaultFn = (): void => {};

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
