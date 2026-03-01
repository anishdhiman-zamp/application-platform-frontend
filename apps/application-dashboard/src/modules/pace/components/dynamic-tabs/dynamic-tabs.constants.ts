'use client';

import type { LucideIcon } from 'lucide-react';
import { X, XCircle } from 'lucide-react';

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
  { id: TAB_CONTEXT_MENU_ACTION_IDS.CLOSE, label: 'Close', icon: X },
  { id: TAB_CONTEXT_MENU_ACTION_IDS.CLOSE_OTHERS, label: 'Close Others', icon: XCircle },
  { id: TAB_CONTEXT_MENU_ACTION_IDS.CLOSE_TO_RIGHT, label: 'Close to the Right', icon: XCircle },
  { id: TAB_CONTEXT_MENU_ACTION_IDS.CLOSE_ALL, label: 'Close All', icon: XCircle, isDestructive: true },
];
