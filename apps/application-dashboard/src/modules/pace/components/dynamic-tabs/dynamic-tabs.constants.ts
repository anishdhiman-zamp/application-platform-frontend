'use client';

import type { LucideIcon } from 'lucide-react';
import { ArrowRightToLine, Minus, X } from 'lucide-react';

export interface TabContextMenuAction {
  id: string;
  label: string;
  icon: LucideIcon;
  isDestructive?: boolean;
}

export const TAB_CONTEXT_MENU_ACTION_IDS = {
  CLOSE: 'close',
  CLOSE_OTHERS: 'close-others',
  CLOSE_TO_RIGHT: 'close-to-right',
  CLOSE_ALL: 'close-all',
} as const;

export type TabContextMenuActionId = (typeof TAB_CONTEXT_MENU_ACTION_IDS)[keyof typeof TAB_CONTEXT_MENU_ACTION_IDS];

export const TAB_CONTEXT_MENU_ACTIONS: TabContextMenuAction[] = [
  { id: TAB_CONTEXT_MENU_ACTION_IDS.CLOSE, label: 'Close tab', icon: X },
  { id: TAB_CONTEXT_MENU_ACTION_IDS.CLOSE_OTHERS, label: 'Close other tabs', icon: Minus },
  { id: TAB_CONTEXT_MENU_ACTION_IDS.CLOSE_TO_RIGHT, label: 'Close tabs to the right', icon: ArrowRightToLine },
  { id: TAB_CONTEXT_MENU_ACTION_IDS.CLOSE_ALL, label: 'Close all tabs', icon: X },
];
