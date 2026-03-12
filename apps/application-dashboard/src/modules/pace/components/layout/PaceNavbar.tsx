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
import { Button, MessageSquareIcon } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { DynamicTab, PaceNavbarItemId, TAB_TYPE } from 'modules/pace/pace.types';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ROUTES_PATH } from '@/constants/routeConfig';
import { useIsMacsFileSystemEnabled } from '@/hooks/useIsMacsFileSystemEnabled';
import {
  MIN_TAB_WIDTH_PX,
  OVERFLOW_BUTTON_WIDTH_PX,
} from '@/modules/pace/components/dynamic-tabs/dynamic-tabs.constants';
import DynamicTabItem from '@/modules/pace/components/dynamic-tabs/DynamicTabItem';
import OverflowTabsPopover from '@/modules/pace/components/dynamic-tabs/OverflowTabsPopover';
import SortableDynamicTabItem from '@/modules/pace/components/dynamic-tabs/SortableDynamicTabItem';
import { isOnSameBasePath, preserveSidebarParam } from '@/modules/pace/components/dynamic-tabs/tab-registry';
import { useNavbarTabs } from '@/modules/pace/components/dynamic-tabs/useNavbarTabs';
import { useVisibleTabCount } from '@/modules/pace/components/dynamic-tabs/useVisibleTabCount';
import { PACE_NAVBAR_ITEMS } from '@/modules/pace/pace.constants';
import { usePaceContext } from '@/modules/pace/pace.context';

const PaceNavbar = () => {
  const pathname = usePathname();
  const router = useRouter();
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

  const hasOverflow = tabs.length > maxVisibleTabs;
  const visibleTabs = hasOverflow ? tabs.slice(0, maxVisibleTabs) : tabs;
  const overflowTabs = hasOverflow ? tabs.slice(maxVisibleTabs) : [];

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
      const activeKey = active.id as string;
      const overKey = (over?.id as string) ?? '';

      const oldIndex = tabs.findIndex((tab) => tab.stableKey === activeKey);
      const newIndex = tabs.findIndex((tab) => tab.stableKey === overKey);

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
      } else {
        router.push(tabPath);
      }
    },
    [tabs, visibleTabs, reorderTabs, setActiveTabId, router],
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
              <OverflowTabsPopover
                overflowTabs={overflowTabs}
                onTabSelect={handleOverflowTabSelect}
                onTabClose={closeTab}
              />
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
