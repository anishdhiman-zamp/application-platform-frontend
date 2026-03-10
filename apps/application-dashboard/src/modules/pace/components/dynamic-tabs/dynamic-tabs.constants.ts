'use client';

export const MIN_TAB_WIDTH_PX = 32;
export const OVERFLOW_BUTTON_WIDTH_PX = 40;

export interface TabContextMenuAction {
  id: string;
  label: string;
}

export const TAB_CONTEXT_MENU_ACTION_IDS = {
  CLOSE: 'close',
  CLOSE_OTHERS: 'close-others',
  CLOSE_TO_RIGHT: 'close-to-right',
  CLOSE_ALL: 'close-all',
} as const;

export type TabContextMenuActionId = (typeof TAB_CONTEXT_MENU_ACTION_IDS)[keyof typeof TAB_CONTEXT_MENU_ACTION_IDS];

export const TAB_CONTEXT_MENU_ACTIONS: TabContextMenuAction[] = [
  { id: TAB_CONTEXT_MENU_ACTION_IDS.CLOSE, label: 'Close tab' },
  { id: TAB_CONTEXT_MENU_ACTION_IDS.CLOSE_OTHERS, label: 'Close other tabs' },
  { id: TAB_CONTEXT_MENU_ACTION_IDS.CLOSE_TO_RIGHT, label: 'Close tabs to the right' },
  { id: TAB_CONTEXT_MENU_ACTION_IDS.CLOSE_ALL, label: 'Close all tabs' },
];
