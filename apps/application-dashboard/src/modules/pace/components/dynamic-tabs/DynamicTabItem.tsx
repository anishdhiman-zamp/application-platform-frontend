'use client';

import { type ReactNode, useCallback, useRef, useState } from 'react';
import { Button } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { X } from 'lucide-react';
import { TAB_CONTEXT_MENU_ACTION_IDS } from 'modules/pace/components/dynamic-tabs/dynamic-tabs.constants';
import { getDefaultIcon } from 'modules/pace/components/dynamic-tabs/dynamic-tabs.utils';
import DynamicTabContextMenu from 'modules/pace/components/dynamic-tabs/DynamicTabContextMenu';
import { isSameBasePath, preserveSidebarParam } from 'modules/pace/components/dynamic-tabs/tab-registry';
import { useIsCompact } from 'modules/pace/components/dynamic-tabs/useIsCompact';
import { useRouter } from 'next/navigation';
import TooltipV2 from '@/components/common/TooltipV2';
import { usePaceContext } from '@/modules/pace/pace.context';
import { CHAT_SIDEBAR_STATE, DynamicTab } from '@/modules/pace/pace.types';
import { defaultFnType, SIDE_OPTIONS } from '@/types/commonTypes';

export interface DynamicTabItemProps {
  tab: DynamicTab;
  isActive: boolean;
  isDragging?: boolean;
  tabIndex: number;
  totalTabs: number;
  onClose: (e: React.MouseEvent, id: string) => void;
  onCloseOthers: (id: string) => void;
  onCloseToRight: (id: string) => void;
  onCloseAll: defaultFnType;
  renderIcon?: (tab: DynamicTab) => ReactNode;
}

const COMPACT_THRESHOLD_PX = 80;

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
  const { setActiveTabId, chatSidebarState, setChatSidebarState } = usePaceContext();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const isCompact = useIsCompact(containerRef, COMPACT_THRESHOLD_PX);

  const handleClick = () => {
    if (isActive) return;

    const tabPath = preserveSidebarParam(tab.path);
    const willChangeBase = !isSameBasePath(tabPath);

    if (chatSidebarState === CHAT_SIDEBAR_STATE.EXPANDED && !willChangeBase) {
      setChatSidebarState(CHAT_SIDEBAR_STATE.COLLAPSED);
    }

    setActiveTabId(tab.id);

    if (willChangeBase) {
      router.push(tabPath);
    } else {
      window.history.pushState(null, '', tabPath);
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
      <div className='min-w-0' ref={containerRef}>
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
            style={{ minWidth: 0 }}
            className={cn(
              'group text-GRAY_700 hover:text-GRAY_1000 hover:bg-GRAY_200 relative flex h-[30px] w-full cursor-pointer items-center justify-start gap-x-2 rounded-[8px] border-[0.75px] border-transparent p-1.5 transition-colors duration-150 ease-in-out',
              isActive &&
                'border-GRAY_500 shadow-tab-shadow text-GRAY_1000 bg-BG_WHITE hover:bg-BG_WHITE border-[0.75px]',
            )}
          >
            {isCompact ? (
              <span className='relative flex size-4 shrink-0 items-center justify-center'>
                <span className='flex items-center justify-center group-hover:hidden'>{icon}</span>
                <span
                  id='dynamic-tab-close-button'
                  role='button'
                  tabIndex={0}
                  onClick={(e) => onClose(e, tab.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      e.stopPropagation();
                      onClose(e as unknown as React.MouseEvent, tab.id);
                    }
                  }}
                  className='hover:bg-accent absolute inset-0 hidden h-4 w-4 cursor-pointer items-center justify-center rounded-sm p-0 group-hover:flex'
                >
                  <X size={12} className='text-GRAY_700' />
                </span>
              </span>
            ) : (
              icon
            )}
            <span className='f-13-500 min-w-0 flex-1 truncate text-left'>{tab.name}</span>
            {!isCompact && (
              <span
                id='dynamic-tab-close-button'
                role='button'
                tabIndex={0}
                onClick={(e) => onClose(e, tab.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    e.stopPropagation();
                    onClose(e as unknown as React.MouseEvent, tab.id);
                  }
                }}
                className='hover:bg-accent ml-0.5 flex h-4 w-4 cursor-pointer items-center justify-center rounded-sm p-0 opacity-0 group-hover:opacity-100'
              >
                <X size={12} className='text-GRAY_700' />
              </span>
            )}
          </Button>
        </DynamicTabContextMenu>
      </div>
    </TooltipV2>
  );
};

export default DynamicTabItem;
