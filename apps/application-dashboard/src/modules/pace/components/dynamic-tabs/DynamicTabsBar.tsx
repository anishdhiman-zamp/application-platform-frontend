'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { AnimatePresence } from 'framer-motion';
import { CHAT_SIDEBAR_STATE, type DynamicTab } from 'modules/pace/pace.types';
import {
  MIN_TAB_WIDTH_PX,
  OVERFLOW_BUTTON_WIDTH_PX,
} from '@/modules/pace/components/dynamic-tabs/dynamic-tabs.constants';
import DynamicTabItem from '@/modules/pace/components/dynamic-tabs/DynamicTabItem';
import OverflowTabsPopover from '@/modules/pace/components/dynamic-tabs/OverflowTabsPopover';
import SortableDynamicTabItem from '@/modules/pace/components/dynamic-tabs/SortableDynamicTabItem';
import { useDynamicTabs } from '@/modules/pace/components/dynamic-tabs/useDynamicTabs';
import { useVisibleTabCount } from '@/modules/pace/components/dynamic-tabs/useVisibleTabCount';
import { usePaceContext } from '@/modules/pace/pace.context';

const DynamicTabsBar = () => {
  const hasMountedRef = useRef(false);
  const tabsContainerRef = useRef<HTMLDivElement>(null);

  const { chatSidebarState, setChatSidebarState, scheduleCollapseOnRouteChange } = usePaceContext();
  const {
    tabs,
    isTabActive,
    navigateToTab: rawNavigateToTab,
    closeTab: rawCloseTab,
    closeOtherTabs,
    closeTabsToRight,
    closeAllTabs: rawCloseAllTabs,
    reorderTabs,
  } = useDynamicTabs();

  const maxVisibleTabs = useVisibleTabCount(tabsContainerRef, tabs.length, MIN_TAB_WIDTH_PX, OVERFLOW_BUTTON_WIDTH_PX);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const [activeId, setActiveId] = useState<string | null>(null);

  const isExpanded = chatSidebarState === CHAT_SIDEBAR_STATE.EXPANDED;
  const isCollapsed = chatSidebarState === CHAT_SIDEBAR_STATE.COLLAPSED;

  const hasOverflow = tabs.length > maxVisibleTabs;
  const visibleTabs = hasOverflow ? tabs.slice(0, maxVisibleTabs) : tabs;
  const overflowTabs = hasOverflow ? tabs.slice(maxVisibleTabs) : [];
  const tabStableKeys = useMemo(() => visibleTabs.map((tab) => tab.stableKey), [visibleTabs]);
  const draggedTab = useMemo(() => visibleTabs.find((tab) => tab.stableKey === activeId), [visibleTabs, activeId]);

  const navigateToTab = useCallback(
    (tab: DynamicTab) => {
      if (isExpanded) {
        setChatSidebarState(CHAT_SIDEBAR_STATE.SIDEBAR);
      }
      rawNavigateToTab(tab);
    },
    [rawNavigateToTab, isExpanded, setChatSidebarState],
  );

  const closeAllTabs = useCallback(() => {
    if (!isCollapsed) {
      scheduleCollapseOnRouteChange();
    }
    rawCloseAllTabs();
  }, [rawCloseAllTabs, isCollapsed, scheduleCollapseOnRouteChange]);

  const closeTab = useCallback(
    (e: React.MouseEvent, id: string) => {
      if (tabs.length === 1 && isTabActive(tabs[0]) && !isCollapsed) {
        scheduleCollapseOnRouteChange();
      }
      rawCloseTab(e, id);
    },
    [rawCloseTab, tabs, isCollapsed, isTabActive, scheduleCollapseOnRouteChange],
  );

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

      navigateToTab(selectedTab);
    },
    [tabs, visibleTabs, reorderTabs, navigateToTab],
  );

  useEffect(() => {
    hasMountedRef.current = true;
  }, []);

  if (tabs.length === 0) return null;

  return (
    <>
      <div className='bg-GRAY_400 mx-4 h-4 w-px shrink-0' />
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div ref={tabsContainerRef} className='flex min-w-0 flex-1 items-center gap-x-1'>
          <SortableContext items={tabStableKeys} strategy={horizontalListSortingStrategy}>
            <AnimatePresence>
              {visibleTabs.map((tab, index) => (
                <SortableDynamicTabItem
                  key={tab.stableKey}
                  tab={tab}
                  isActive={!isExpanded && isTabActive(tab)}
                  isAnyDragging={activeId !== null}
                  tabIndex={index}
                  totalTabs={visibleTabs.length}
                  skipAnimation={!hasMountedRef.current}
                  onNavigate={navigateToTab}
                  onClose={closeTab}
                  onCloseOthers={closeOtherTabs}
                  onCloseToRight={closeTabsToRight}
                  onCloseAll={closeAllTabs}
                />
              ))}
            </AnimatePresence>
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
                isActive={!isExpanded && isTabActive(draggedTab)}
                isDragging
                tabIndex={visibleTabs.findIndex((t) => t.id === draggedTab.id)}
                totalTabs={visibleTabs.length}
                onNavigate={navigateToTab}
                onClose={closeTab}
                onCloseOthers={closeOtherTabs}
                onCloseToRight={closeTabsToRight}
                onCloseAll={closeAllTabs}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </>
  );
};

export default DynamicTabsBar;
