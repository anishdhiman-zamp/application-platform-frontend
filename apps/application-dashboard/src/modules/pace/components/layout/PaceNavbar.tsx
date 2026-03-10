'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove, horizontalListSortingStrategy, SortableContext } from '@dnd-kit/sortable';
import { Button, MessageSquareIcon, Popover, PopoverContent, PopoverTrigger } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { getDefaultIcon } from 'modules/pace/components/dynamic-tabs/dynamic-tabs.utils';
import { DynamicTab, PaceNavbarItemId, TAB_TYPE } from 'modules/pace/pace.types';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { ROUTES_PATH } from '@/constants/routeConfig';
import { useIsMacsFileSystemEnabled } from '@/hooks/useIsMacsFileSystemEnabled';
import {
  MIN_TAB_WIDTH_PX,
  OVERFLOW_BUTTON_WIDTH_PX,
} from '@/modules/pace/components/dynamic-tabs/dynamic-tabs.constants';
import DynamicTabItem from '@/modules/pace/components/dynamic-tabs/DynamicTabItem';
import SortableDynamicTabItem from '@/modules/pace/components/dynamic-tabs/SortableDynamicTabItem';
import { isOnSameBasePath, preserveSidebarParam } from '@/modules/pace/components/dynamic-tabs/tab-registry';
import { useNavbarTabs } from '@/modules/pace/components/dynamic-tabs/useNavbarTabs';
import { useVisibleTabCount } from '@/modules/pace/components/dynamic-tabs/useVisibleTabCount';
import { PACE_NAVBAR_ITEMS } from '@/modules/pace/pace.constants';
import { usePaceContext } from '@/modules/pace/pace.context';

const PaceNavbar = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isPaceSidebarOpen, setIsPaceSidebarOpen, startNewChat, setActiveTabId } = usePaceContext();
  const {
    tabs,
    isTabActive,
    isOnAnyDynamicTab,
    closeTab,
    closeOtherTabs,
    closeTabsToRight,
    closeAllTabs,
    reorderTabs,
  } = useNavbarTabs();
  const tabsContainerRef = useRef<HTMLDivElement>(null);

  const { isMacsFileSystemEnabled } = useIsMacsFileSystemEnabled();
  const maxVisibleTabs = useVisibleTabCount(tabsContainerRef, tabs.length, MIN_TAB_WIDTH_PX, OVERFLOW_BUTTON_WIDTH_PX);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const [activeId, setActiveId] = useState<string | null>(null);
  const [isOverflowOpen, setIsOverflowOpen] = useState(false);

  const hasOverflow = tabs.length > maxVisibleTabs;
  const visibleTabs = hasOverflow ? tabs.slice(0, maxVisibleTabs) : tabs;
  const overflowTabs = hasOverflow ? tabs.slice(maxVisibleTabs) : [];
  const overflowCount = overflowTabs.length;

  const tabStableKeys = useMemo(() => visibleTabs.map((tab) => tab.stableKey), [visibleTabs]);

  const filteredNavbarItems = useMemo(() => {
    return PACE_NAVBAR_ITEMS.filter((item) => {
      if (item.id === PaceNavbarItemId.FILES) {
        return isMacsFileSystemEnabled;
      }

      return true;
    });
  }, [isMacsFileSystemEnabled]);

  const draggedTab = useMemo(() => visibleTabs.find((tab) => tab.stableKey === activeId), [visibleTabs, activeId]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveId(null);

    if (active.id !== over?.id) {
      const oldIndex = tabStableKeys.indexOf(active.id as string);
      const newIndex = tabStableKeys.indexOf((over?.id as string) ?? '');

      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = arrayMove(tabs, oldIndex, newIndex).map((tab) => tab.id);

        reorderTabs(newOrder);
      }
    }
  };

  const handleOverflowTabSelect = useCallback(
    (selectedTab: DynamicTab) => {
      if (visibleTabs.length === 0) return;

      const lastVisibleTab = visibleTabs[visibleTabs.length - 1];
      const currentOrder = tabs.map((t) => t.id);
      const selectedIdx = currentOrder.indexOf(selectedTab.id);
      const lastVisibleIdx = currentOrder.indexOf(lastVisibleTab.id);

      if (selectedIdx !== -1 && lastVisibleIdx !== -1) {
        const newOrder = [...currentOrder];

        newOrder[lastVisibleIdx] = selectedTab.id;
        newOrder[selectedIdx] = lastVisibleTab.id;
        reorderTabs(newOrder);
      }

      setActiveTabId(selectedTab.id);

      const tabType = selectedTab.type ?? TAB_TYPE.FILE;
      const canUseFastSwitch = isOnSameBasePath(tabType);
      const tabPath = preserveSidebarParam(selectedTab.path);

      if (canUseFastSwitch) {
        window.history.pushState({ tabId: selectedTab.id, tabType }, '', tabPath);
      }

      setIsOverflowOpen(false);
    },
    [tabs, visibleTabs, reorderTabs, setActiveTabId],
  );

  const isNavItemActive = (id: PaceNavbarItemId, path: string) => {
    if (id === PaceNavbarItemId.HOME) {
      return pathname === path;
    }

    if (isOnAnyDynamicTab()) {
      return false;
    }

    return pathname?.includes(path) ?? false;
  };

  const getNavItemHref = (id: PaceNavbarItemId, path: string) => {
    if (id === PaceNavbarItemId.HOME) {
      return path;
    }

    const sParam = searchParams?.get('s');

    if (sParam) {
      return `${path}?s=${sParam}`;
    }

    return path;
  };

  const handleNavItemClick = (id: PaceNavbarItemId) => {
    if (id === PaceNavbarItemId.HOME) {
      setIsPaceSidebarOpen(false);
      startNewChat();
    }
  };

  return (
    <div className='flex h-[42px] items-center overflow-hidden px-2 pt-1.5 pb-1.5'>
      {!isPaceSidebarOpen && pathname !== ROUTES_PATH.CHAT && (
        <>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => setIsPaceSidebarOpen(true)}
            className='text-GRAY_700 hover:text-GRAY_1000 hover:bg-GRAY_200 h-7 w-7 shrink-0'
          >
            <MessageSquareIcon size={16} />
          </Button>
          <div className='bg-GRAY_300 mx-2 h-4 w-px shrink-0' />
        </>
      )}

      {/* Static navbar items */}
      <div className='flex shrink-0 items-center gap-x-2'>
        {filteredNavbarItems.map((item) => (
          <Link
            key={item.id}
            href={getNavItemHref(item.id, item.path)}
            className={cn(
              'text-GRAY_900 hover:text-GRAY_1000 hover:bg-GRAY_200 flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg p-[7px]',
              isNavItemActive(item.id, item.path) &&
                'border-GRAY_500 text-GRAY_1000 hover:text-GRAY_1000 shadow-tab-shadow border border-[0.75px] bg-white hover:bg-white',
            )}
            role='button'
            tabIndex={0}
            onClick={() => handleNavItemClick(item.id)}
          >
            {item.iconComponent}
          </Link>
        ))}
      </div>

      {tabs.length > 0 && <div className='bg-GRAY_300 mx-3 h-4 w-px shrink-0' />}

      {tabs.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div ref={tabsContainerRef} className='flex min-w-0 flex-1 items-center gap-x-1'>
            <SortableContext items={tabStableKeys} strategy={horizontalListSortingStrategy}>
              {visibleTabs.map((tab, index) => (
                <SortableDynamicTabItem
                  key={tab.stableKey}
                  tab={tab}
                  isActive={isTabActive(tab)}
                  isAnyDragging={activeId !== null}
                  tabIndex={index}
                  totalTabs={visibleTabs.length}
                  onClose={closeTab}
                  onCloseOthers={closeOtherTabs}
                  onCloseToRight={closeTabsToRight}
                  onCloseAll={closeAllTabs}
                />
              ))}
            </SortableContext>
            {hasOverflow && (
              <Popover open={isOverflowOpen} onOpenChange={setIsOverflowOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant='ghost'
                    className='text-GRAY_700 hover:text-GRAY_1000 hover:bg-GRAY_200 f-12-500 h-[30px] shrink-0 rounded-[8px] px-2'
                  >
                    +{overflowCount}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  align='end'
                  sideOffset={6}
                  className='max-h-[300px] w-[220px] overflow-y-auto p-1 [scrollbar-width:thin]'
                >
                  {overflowTabs.map((tab) => (
                    <Button
                      key={tab.id}
                      variant='ghost'
                      onClick={() => handleOverflowTabSelect(tab)}
                      className='hover:bg-GRAY_100 flex h-auto w-full items-center justify-start gap-x-2 rounded-md px-2 py-1.5'
                    >
                      <span className='shrink-0'>{getDefaultIcon(tab)}</span>
                      <span className='f-12-500 text-GRAY_900 min-w-0 truncate'>{tab.name}</span>
                    </Button>
                  ))}
                </PopoverContent>
              </Popover>
            )}
          </div>
          <DragOverlay>
            {draggedTab ? (
              <div className='-rotate-2 rounded-lg border shadow-lg'>
                <DynamicTabItem
                  tab={draggedTab}
                  isActive={isTabActive(draggedTab)}
                  isDragging
                  tabIndex={visibleTabs.findIndex((t) => t.id === draggedTab.id)}
                  totalTabs={visibleTabs.length}
                  onClose={closeTab}
                  onCloseOthers={closeOtherTabs}
                  onCloseToRight={closeTabsToRight}
                  onCloseAll={closeAllTabs}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
};

export default PaceNavbar;
