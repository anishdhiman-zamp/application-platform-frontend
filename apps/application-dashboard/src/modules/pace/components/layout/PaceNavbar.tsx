'use client';

import { useMemo, useState } from 'react';
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
import { PaceNavbarItemId } from 'modules/pace/pace.types';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { ROUTES_PATH } from '@/constants/routeConfig';
import { useIsMacsFileSystemEnabled } from '@/hooks/useIsMacsFileSystemEnabled';
import DynamicTabItem from '@/modules/pace/components/dynamic-tabs/DynamicTabItem';
import SortableDynamicTabItem from '@/modules/pace/components/dynamic-tabs/SortableDynamicTabItem';
import { useNavbarTabs } from '@/modules/pace/components/dynamic-tabs/useNavbarTabs';
import { PACE_NAVBAR_ITEMS } from '@/modules/pace/pace.constants';
import { usePaceContext } from '@/modules/pace/pace.context';

const PaceNavbar = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isPaceSidebarOpen, setIsPaceSidebarOpen, startNewChat } = usePaceContext();
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
  const { isMacsFileSystemEnabled } = useIsMacsFileSystemEnabled();

  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const tabStableKeys = useMemo(() => tabs.map((tab) => tab.stableKey), [tabs]);

  const filteredNavbarItems = useMemo(() => {
    return PACE_NAVBAR_ITEMS.filter((item) => {
      if (item.id === PaceNavbarItemId.FILES) {
        return isMacsFileSystemEnabled;
      }

      return true;
    });
  }, [isMacsFileSystemEnabled]);

  const draggedTab = useMemo(() => tabs.find((tab) => tab.stableKey === activeId), [tabs, activeId]);

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
          <SortableContext items={tabStableKeys} strategy={horizontalListSortingStrategy}>
            <div className='flex min-w-0 flex-1 items-center gap-x-1'>
              {tabs.map((tab, index) => (
                <SortableDynamicTabItem
                  key={tab.stableKey}
                  tab={tab}
                  isActive={isTabActive(tab)}
                  isAnyDragging={activeId !== null}
                  tabIndex={index}
                  totalTabs={tabs.length}
                  onClose={closeTab}
                  onCloseOthers={closeOtherTabs}
                  onCloseToRight={closeTabsToRight}
                  onCloseAll={closeAllTabs}
                />
              ))}
            </div>
          </SortableContext>
          <DragOverlay>
            {draggedTab ? (
              <div className='-rotate-2 rounded-lg border shadow-lg'>
                <DynamicTabItem
                  tab={draggedTab}
                  isActive={isTabActive(draggedTab)}
                  isDragging
                  tabIndex={tabs.findIndex((t) => t.id === draggedTab.id)}
                  totalTabs={tabs.length}
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
