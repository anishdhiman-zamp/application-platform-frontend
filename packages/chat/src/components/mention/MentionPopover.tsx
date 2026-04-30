'use client';

import { ScrollContainer } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { KEYBOARD_KEYS } from '@zamp-platform/utils';
import React, { useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';

import type { ReferenceKindDescriptor, ReferencePickerAdapter, ReferenceSearchHit } from '../../types/references.types';
import { RECENT_TAB, V1_KINDS } from './constants';
import { EmptyRow, MentionResultRow } from './MentionResultRow';
import { MentionTabs } from './MentionTabs';
import { useReferenceSearch } from './useReferenceSearch';
import { hitKey } from './utils';

const MAX_LIST_HEIGHT = 210;

export interface MentionPopoverProps {
  adapter: ReferencePickerAdapter;
  kinds: ReferenceKindDescriptor[];
  initialKind?: string | null;
  query: string;
  open: boolean;
  onSelect: (hit: ReferenceSearchHit) => void;
  onClose: () => void;
}

export interface MentionPopoverHandle {
  onKeyDown: (event: KeyboardEvent) => boolean;
}

export const MentionPopover = React.forwardRef<MentionPopoverHandle, MentionPopoverProps>(
  ({ adapter, kinds, initialKind, query, open, onSelect, onClose }, ref) => {
    const listRef = useRef<HTMLDivElement | null>(null);
    const listInnerRef = useRef<HTMLDivElement | null>(null);

    const [activeTab, setActiveTab] = useState<string>(initialKind ?? RECENT_TAB);
    const [activeIdx, setActiveIdx] = useState(0);
    const [listHeight, setListHeight] = useState<number | 'auto'>('auto');

    const visibleTabs = useMemo<ReferenceKindDescriptor[]>(() => {
      const allowed = kinds.filter((k) => V1_KINDS.has(k.kind));
      return [{ kind: RECENT_TAB, display_label: 'Recent', icon_hint: '@', aliases: [] }, ...allowed];
    }, [kinds]);

    const activeKindDescriptor = useMemo(
      () => visibleTabs.find((t) => t.kind === activeTab) ?? null,
      [visibleTabs, activeTab],
    );

    const { items, isLoading } = useReferenceSearch({ adapter, activeTab, query });
    const showRecentHeader = activeTab === RECENT_TAB && items?.length > 0 && !query;

    const scrollActiveRowIntoView = useCallback(() => {
      const el = listRef.current?.querySelector<HTMLElement>(`[data-idx="${activeIdx}"]`);
      el?.scrollIntoView({ block: 'nearest' });
    }, [activeIdx]);

    const observeListHeight = useCallback(() => {
      const el = listInnerRef.current;
      if (!el) return undefined;
      const measure = () => setListHeight(Math.min(el.scrollHeight, MAX_LIST_HEIGHT));
      measure();
      const observer = new ResizeObserver(measure);
      observer.observe(el);
      return () => observer.disconnect();
    }, []);

    const cycleTab = useCallback(
      (direction: 1 | -1) => {
        if (visibleTabs.length === 0) return;
        const currentIdx = visibleTabs.findIndex((t) => t.kind === activeTab);
        const base = currentIdx < 0 ? 0 : currentIdx;
        const next = (base + direction + visibleTabs.length) % visibleTabs.length;
        setActiveTab(visibleTabs[next].kind);
      },
      [visibleTabs, activeTab],
    );

    const moveActiveIdx = useCallback(
      (direction: 1 | -1) => {
        setActiveIdx((i) => (items.length === 0 ? 0 : (i + direction + items.length) % items.length));
      },
      [items.length],
    );

    const commitSelection = useCallback(() => {
      const hit = items[activeIdx];
      if (hit) onSelect(hit);
    }, [items, activeIdx, onSelect]);

    const handleKeyDown = useCallback(
      (event: KeyboardEvent): boolean => {
        switch (event.key) {
          case KEYBOARD_KEYS.TAB:
            cycleTab(event.shiftKey ? -1 : 1);
            return true;
          case KEYBOARD_KEYS.ARROW_DOWN:
            moveActiveIdx(1);
            return true;
          case KEYBOARD_KEYS.ARROW_UP:
            moveActiveIdx(-1);
            return true;
          case KEYBOARD_KEYS.ENTER:
            // Shift+Enter is reserved for newline in the editor — let it pass through.
            if (event.shiftKey) return false;
            commitSelection();
            return true;
          case KEYBOARD_KEYS.ESCAPE:
            onClose();
            return true;
          default:
            return false;
        }
      },
      [cycleTab, moveActiveIdx, commitSelection, onClose],
    );

    const handleRowMouseDown = useCallback(
      (e: React.MouseEvent, hit: ReferenceSearchHit) => {
        e.preventDefault();
        onSelect(hit);
      },
      [onSelect],
    );

    const getEmptyLabel = () => {
      if (query) return 'No results found';
      if (activeTab === RECENT_TAB) return 'No recent items';
      return `Search ${activeKindDescriptor?.display_label ?? 'items'}…`;
    };

    useImperativeHandle(ref, () => ({ onKeyDown: handleKeyDown }), [handleKeyDown]);

    useEffect(() => {
      setActiveIdx(0);
    }, [items]);

    useEffect(() => {
      scrollActiveRowIntoView();
    }, [scrollActiveRowIntoView]);

    useEffect(() => observeListHeight(), [observeListHeight]);

    const renderListBody = () => {
      if (isLoading) return <EmptyRow label='Loading…' loading />;
      if (items?.length === 0) return <EmptyRow label={getEmptyLabel()} />;
      return items?.map((item, idx) => (
        <MentionResultRow
          key={hitKey(item)}
          item={item}
          idx={idx}
          isActive={idx === activeIdx}
          onMouseDown={handleRowMouseDown}
          onMouseEnter={setActiveIdx}
        />
      ));
    };

    return (
      <div
        className={cn(
          'mention-popover',
          !open && 'mention-popover--closing',
          'border-GRAY_400 bg-BG_WHITE dark:bg-popover shadow-chatbot-shadow relative z-[1003] flex w-full flex-col overflow-hidden rounded-[12px] border p-2',
        )}
        role='listbox'
      >
        <MentionTabs tabs={visibleTabs} activeTab={activeTab} onSelect={setActiveTab} />

        <div
          ref={listRef}
          className='mention-popover-list mt-4 flex flex-col'
          style={{ height: listHeight, maxHeight: MAX_LIST_HEIGHT }}
        >
          <ScrollContainer scrollbarStyle='none' fadeHeight='h-4'>
            <div ref={listInnerRef}>
              {showRecentHeader && <div className='text-GRAY_700 f-12-550 px-2 pb-1'>Recent</div>}
              {renderListBody()}
            </div>
          </ScrollContainer>
        </div>

        <div className='pointer-events-none flex items-center justify-end gap-1 px-3 py-1.5'>
          <kbd className='border-GRAY_400 bg-BG_WHITE text-GRAY_950 inline-flex h-[14px] items-center justify-center rounded-[4px] border px-1 text-[10px] leading-none font-[450]'>
            Tab
          </kbd>
          <span className='text-GRAY_700 text-[11px] leading-none font-[450]'>to switch</span>
        </div>
      </div>
    );
  },
);

MentionPopover.displayName = 'MentionPopover';
