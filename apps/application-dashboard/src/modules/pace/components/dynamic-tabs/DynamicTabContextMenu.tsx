'use client';

import { useState } from 'react';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import {
  TAB_CONTEXT_MENU_ACTION_IDS,
  TAB_CONTEXT_MENU_ACTIONS,
  type TabContextMenuAction,
} from '@/modules/pace/components/dynamic-tabs/dynamic-tabs.constants';

interface DynamicTabContextMenuProps {
  children: React.ReactNode;
  tabIndex: number;
  totalTabs: number;
  disabled?: boolean;
  onOpenChange?: (open: boolean) => void;
  onActionClick: (actionId: string) => void;
}

const DynamicTabContextMenu = ({
  children,
  tabIndex,
  totalTabs,
  disabled,
  onOpenChange,
  onActionClick,
}: DynamicTabContextMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenChange = (open: boolean) => {
    if (disabled && open) return;
    setIsOpen(open);
    onOpenChange?.(open);
  };

  const getFilteredActions = (): TabContextMenuAction[] => {
    return TAB_CONTEXT_MENU_ACTIONS.filter((action) => {
      if (action.id === TAB_CONTEXT_MENU_ACTION_IDS.CLOSE_OTHERS && totalTabs <= 1) {
        return false;
      }

      if (action.id === TAB_CONTEXT_MENU_ACTION_IDS.CLOSE_TO_RIGHT && tabIndex >= totalTabs - 1) {
        return false;
      }

      return true;
    });
  };

  const filteredActions = getFilteredActions();

  return (
    <ContextMenu onOpenChange={handleOpenChange}>
      <ContextMenuTrigger asChild disabled={disabled}>
        {children}
      </ContextMenuTrigger>
      {isOpen && !disabled && (
        <ContextMenuContent className='flex min-w-[180px] flex-col gap-y-[2px]'>
          {filteredActions.map((action) => (
            <ContextMenuItem
              key={action.id}
              className={cn(
                'hover:bg-GRAY_100 f-12-500 text-GRAY_900 cursor-pointer rounded-md',
                action.isDestructive && 'text-red-600',
              )}
              onClick={() => onActionClick(action.id)}
            >
              <action.icon className='size-4' />
              {action.label}
            </ContextMenuItem>
          ))}
        </ContextMenuContent>
      )}
    </ContextMenu>
  );
};

export default DynamicTabContextMenu;
