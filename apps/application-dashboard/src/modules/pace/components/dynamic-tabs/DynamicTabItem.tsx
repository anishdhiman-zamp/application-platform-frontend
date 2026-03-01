'use client';

import { type ReactNode, useCallback, useState } from 'react';
import { Button } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { X } from 'lucide-react';
import { TAB_CONTEXT_MENU_ACTION_IDS } from 'modules/pace/components/dynamic-tabs/dynamic-tabs.constants';
import { getDefaultIcon } from 'modules/pace/components/dynamic-tabs/dynamic-tabs.utils';
import DynamicTabContextMenu from 'modules/pace/components/dynamic-tabs/DynamicTabContextMenu';
import { isOnSameBasePath, preserveSidebarParam } from 'modules/pace/components/dynamic-tabs/tab-registry';
import { useRouter } from 'next/navigation';
import TooltipV2 from '@/components/common/TooltipV2';
import { usePaceContext } from '@/modules/pace/pace.context';
import { DynamicTab, TAB_TYPE } from '@/modules/pace/pace.types';
import { SIDE_OPTIONS } from '@/types/commonTypes';

export interface DynamicTabItemProps {
  tab: DynamicTab;
  isActive: boolean;
  isDragging?: boolean;
  tabIndex: number;
  totalTabs: number;
  onClose: (e: React.MouseEvent, id: string) => void;
  onCloseOthers: (id: string) => void;
  onCloseToRight: (id: string) => void;
  onCloseAll: () => void;
  renderIcon?: (tab: DynamicTab) => ReactNode;
}

const DynamicTabItem = ({
  tab,
  isActive,
  isDragging = false,
  tabIndex,
  totalTabs,
  onClose,
  onCloseOthers,
  onCloseToRight,
  onCloseAll,
  renderIcon,
}: DynamicTabItemProps) => {
  const { setActiveTabId } = usePaceContext();
  const router = useRouter();

  const handleClick = () => {
    if (isActive) return;

    const tabType = tab.type ?? TAB_TYPE.FILE;
    const canUseFastSwitch = isOnSameBasePath(tabType);
    const tabPath = preserveSidebarParam(tab.path);

    setActiveTabId(tab.id);

    if (canUseFastSwitch) {
      window.history.pushState({ tabId: tab.id, tabType }, '', tabPath);
    } else {
      router.push(tabPath);
    }
  };

  const handleContextMenuAction = useCallback(
    (actionId: string) => {
      switch (actionId) {
        case TAB_CONTEXT_MENU_ACTION_IDS.CLOSE:
          onClose({ preventDefault: () => {}, stopPropagation: () => {} } as React.MouseEvent, tab.id);
          break;
        case TAB_CONTEXT_MENU_ACTION_IDS.CLOSE_OTHERS:
          onCloseOthers(tab.id);
          break;
        case TAB_CONTEXT_MENU_ACTION_IDS.CLOSE_TO_RIGHT:
          onCloseToRight(tab.id);
          break;
        case TAB_CONTEXT_MENU_ACTION_IDS.CLOSE_ALL:
          onCloseAll();
          break;
      }
    },
    [tab.id, onClose, onCloseOthers, onCloseToRight, onCloseAll],
  );

  const icon = renderIcon ? renderIcon(tab) : getDefaultIcon(tab);
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);

  return (
    <TooltipV2
      tooltipBody={tab.name}
      side={SIDE_OPTIONS.BOTTOM}
      delayDuration={500}
      asChildTrigger
      disabled={isDragging || isContextMenuOpen}
    >
      <div>
        <DynamicTabContextMenu
          tabIndex={tabIndex}
          totalTabs={totalTabs}
          disabled={isDragging}
          onOpenChange={setIsContextMenuOpen}
          onActionClick={handleContextMenuAction}
        >
          <Button
            variant='ghost'
            onClick={handleClick}
            className={cn(
              'group relative flex h-[30px] w-full min-w-[48px] cursor-pointer items-center justify-start gap-x-2 rounded-[8px] border p-2 transition-all duration-150 ease-in-out',
              isActive
                ? 'border-GRAY_300 text-GRAY_1000 bg-white hover:bg-white'
                : 'text-GRAY_700 hover:text-GRAY_1000 hover:bg-GRAY_200 border-transparent',
            )}
          >
            {icon}
            <span className='f-11-500 min-w-0 flex-1 truncate text-left'>{tab.name}</span>
            <Button
              id='dynamic-tab-close-button'
              variant='ghost'
              size='xxsmall'
              onClick={(e) => onClose(e, tab.id)}
              className='ml-0.5 h-4 w-4 shrink-0 p-0 opacity-0 group-hover:opacity-100'
            >
              <X size={12} className='text-GRAY_700' />
            </Button>
          </Button>
        </DynamicTabContextMenu>
      </div>
    </TooltipV2>
  );
};

export default DynamicTabItem;
