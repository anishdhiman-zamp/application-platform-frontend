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
import { cn } from '@zamp-platform/ui/utils';
import DynamicTabItem from 'modules/pace/components/layout/DynamicTabItem';
import { PaceNavbarItemId } from 'modules/pace/pace.types';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import SortableDynamicTabItem from '@/modules/pace/components/layout/SortableDynamicTabItem';
import { useDynamicTabs } from '@/modules/pace/hooks/useDynamicTabs';
import { PACE_NAVBAR_ITEMS } from '@/modules/pace/pace.constants';
import { usePaceContext } from '@/modules/pace/pace.context';

const PaceNavbar = () => {
  const pathname = usePathname();
  const { setIsPaceSidebarOpen, startNewChat } = usePaceContext();
  const { dynamicTabs, isDynamicTabActive, isOnAnyDynamicTab, handleCloseDynamicTab, handleReorderTabs } =
    useDynamicTabs();

  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const tabStableKeys = useMemo(() => dynamicTabs.map((tab) => tab.stableKey), [dynamicTabs]);

  const activeTab = useMemo(() => dynamicTabs.find((tab) => tab.stableKey === activeId), [dynamicTabs, activeId]);

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
        const newOrder = arrayMove(dynamicTabs, oldIndex, newIndex).map((tab) => tab.id);

        handleReorderTabs(newOrder);
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

  const handleNavItemClick = (id: PaceNavbarItemId) => {
    if (id === PaceNavbarItemId.HOME) {
      setIsPaceSidebarOpen(false);
      startNewChat();
    }
  };

  return (
    <div className='flex h-[38px] items-center overflow-hidden px-2 pt-1.5 pb-1'>
      {/* Static navbar items */}
      <div className='flex shrink-0 items-center gap-x-2'>
        {PACE_NAVBAR_ITEMS.map((item) => (
          <Link
            key={item.id}
            href={item.path}
            className={cn(
              'text-GRAY_900 hover:text-GRAY_1000 hover:bg-GRAY_200 flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg p-2',
              isNavItemActive(item.id, item.path) &&
                'border-GRAY_400 text-GRAY_1000 hover:text-GRAY_1000 shadow-tab-shadow border bg-white hover:bg-white',
            )}
            role='button'
            tabIndex={0}
            onClick={() => handleNavItemClick(item.id)}
          >
            {item.iconComponent}
          </Link>
        ))}
      </div>

      {dynamicTabs.length > 0 && <div className='bg-GRAY_300 mx-3 h-4 w-px shrink-0' />}

      {dynamicTabs.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={tabStableKeys} strategy={horizontalListSortingStrategy}>
            <div className='flex min-w-0 flex-1 items-center gap-x-1'>
              {dynamicTabs.map((tab) => (
                <SortableDynamicTabItem
                  key={tab.stableKey}
                  tab={tab}
                  isActive={isDynamicTabActive(tab)}
                  isAnyDragging={activeId !== null}
                  onClose={handleCloseDynamicTab}
                />
              ))}
            </div>
          </SortableContext>
          <DragOverlay>
            {activeTab ? (
              <div className='-rotate-2 rounded-lg border shadow-lg'>
                <DynamicTabItem
                  tab={activeTab}
                  isActive={isDynamicTabActive(activeTab)}
                  isDragging
                  onClose={handleCloseDynamicTab}
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
