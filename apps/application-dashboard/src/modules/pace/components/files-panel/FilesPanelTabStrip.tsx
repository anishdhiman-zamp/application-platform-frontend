'use client';

import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@zamp-platform/ui/utils';
import DynamicTabItem from 'modules/pace/components/dynamic-tabs/DynamicTabItem';
import { useDynamicTabs } from 'modules/pace/components/dynamic-tabs/useDynamicTabs';
import { TAB_TYPE } from 'modules/pace/pace.types';
import FilesPanelAddTabMenu from '@/modules/pace/components/files-panel/FilesPanelAddTabMenu';

const PANEL_TAB_TYPES = new Set<string>([TAB_TYPE.FILE, TAB_TYPE.AGENT]);

interface FilesPanelTabStripProps {
  onOverflowChange?: (isOverflowing: boolean) => void;
}

const FADE_MASK_LEFT = 'linear-gradient(to right, transparent, black 16px)';
const FADE_MASK_RIGHT = 'linear-gradient(to right, black calc(100% - 16px), transparent)';
const FADE_MASK_BOTH = 'linear-gradient(to right, transparent, black 16px, black calc(100% - 16px), transparent)';

const getMaskStyle = (canScrollLeft: boolean, canScrollRight: boolean) => {
  if (canScrollLeft && canScrollRight) return { maskImage: FADE_MASK_BOTH, WebkitMaskImage: FADE_MASK_BOTH };
  if (canScrollLeft) return { maskImage: FADE_MASK_LEFT, WebkitMaskImage: FADE_MASK_LEFT };
  if (canScrollRight) return { maskImage: FADE_MASK_RIGHT, WebkitMaskImage: FADE_MASK_RIGHT };

  return undefined;
};

const FilesPanelTabStrip = ({ onOverflowChange }: FilesPanelTabStripProps) => {
  const {
    tabs: allTabs,
    isTabActive,
    navigateToTab,
    closeTab,
    closeOtherTabs,
    closeTabsToRight,
    closeAllTabs,
  } = useDynamicTabs();

  const tabs = useMemo(() => allTabs.filter((tab) => PANEL_TAB_TYPES.has(tab.type ?? TAB_TYPE.FILE)), [allTabs]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const previousTabCount = useRef(tabs.length);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);

  const maskStyle = getMaskStyle(canScrollLeft, canScrollRight);

  const updateScrollState = useCallback(() => {
    const scrollEl = scrollRef.current;
    const tabsEl = tabsRef.current;

    if (!scrollEl || !tabsEl) return;

    const overflowing = tabsEl.scrollWidth > scrollEl.clientWidth + 1;

    setIsOverflowing(overflowing);
    onOverflowChange?.(overflowing);
    setCanScrollLeft(scrollEl.scrollLeft > 0);
    setCanScrollRight(scrollEl.scrollLeft + scrollEl.clientWidth < scrollEl.scrollWidth - 1);
  }, [onOverflowChange]);

  const handleTabsChange = useCallback(() => {
    const el = scrollRef.current;

    if (!el) return;

    if (tabs.length > previousTabCount.current) {
      el.scrollTo({ left: el.scrollWidth, behavior: 'smooth' });
    }

    previousTabCount.current = tabs.length;
    updateScrollState();
  }, [tabs.length, updateScrollState]);

  const subscribeToResize = useCallback(() => {
    const scrollEl = scrollRef.current;
    const tabsEl = tabsRef.current;

    if (!scrollEl || !tabsEl) return;

    const observer = new ResizeObserver(updateScrollState);

    observer.observe(scrollEl);
    observer.observe(tabsEl);

    return () => observer.disconnect();
  }, [updateScrollState]);

  useEffect(() => {
    handleTabsChange();
  }, [handleTabsChange]);

  useEffect(() => subscribeToResize(), [subscribeToResize]);

  return (
    <div
      ref={scrollRef}
      onScroll={updateScrollState}
      style={maskStyle}
      className='flex h-8 min-w-0 flex-1 items-center overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
    >
      <div ref={tabsRef} className='flex shrink-0 items-center'>
        {tabs.map((tab, index) => {
          const previousTab = tabs[index - 1];
          const isAdjacentToActive = !!previousTab && (isTabActive(tab) || isTabActive(previousTab));

          return (
            <Fragment key={tab.stableKey}>
              {index > 0 && (
                <div
                  aria-hidden
                  className={cn('bg-GRAY_400 mx-1.5 h-4 w-px shrink-0', isAdjacentToActive && 'invisible')}
                />
              )}
              <div className='max-w-[200px] min-w-[120px] shrink-0'>
                <DynamicTabItem
                  tab={tab}
                  isActive={isTabActive(tab)}
                  tabIndex={index}
                  totalTabs={tabs.length}
                  onNavigate={navigateToTab}
                  onClose={closeTab}
                  onCloseOthers={closeOtherTabs}
                  onCloseToRight={closeTabsToRight}
                  onCloseAll={closeAllTabs}
                />
              </div>
            </Fragment>
          );
        })}
      </div>
      {!isOverflowing && <FilesPanelAddTabMenu align='start' triggerClassName='ml-1' />}
    </div>
  );
};

export default FilesPanelTabStrip;
