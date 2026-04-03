import { KEYBOARD_KEYS } from '@zamp-platform/utils';
import { ROUTES_PATH } from 'constants/routeConfig';

export { KEYBOARD_KEYS };

export const KEYS_DELIMITER = '::';

export const MONITOR_KEYS = [
  'KeyA',
  'KeyB',
  'KeyC',
  'KeyD',
  'KeyG',
  'KeyH',
  'KeyI',
  'KeyK',
  'KeyM',
  'KeyO',
  'KeyP',
  'KeyR',
  'KeyT',
  'KeyK',
  'ShiftLeft',
  'MetaLeft',
  'Escape',
  'MetaLeft',
];

export const KEYBOARD_FUNCTION_KEYS = {
  SHIFT_KEY: 'shiftKey',
  META_KEY: 'metaKey',
  OPTION: 'altKey',
};

export const FUNCTION_KEYS_ICON = {
  SHIFT_KEY: '⇧',
  META_KEY: '⌘',
  OPTION: '⌥',
};

export const SHORTCUTS_TABS = [
  {
    label: 'Data',
    value: 'data',
    id: ROUTES_PATH.DATA,
  },
];

/**
 * Handles keyboard activation for interactive non-button elements (e.g. `role="button"`).
 * Triggers the callback on Enter or Space, with `preventDefault` and `stopPropagation`
 * to mirror native button behavior.
 */
export const handleActivationKeyDown = (e: React.KeyboardEvent, callback: (e: React.KeyboardEvent) => void) => {
  if (e.key === KEYBOARD_KEYS.ENTER || e.key === KEYBOARD_KEYS.SPACE) {
    e.preventDefault();
    e.stopPropagation();
    callback(e);
  }
};
