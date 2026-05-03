import { RefObject, useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from 'hooks/toolkit';
import { selectActiveTabId, selectTabRecord, workspaceTabsActions } from '@/store/slices/workspace-tabs.slice';

const SCROLL_DEBOUNCE_MS = 150;

interface UseScrollRestoreOptionsType {
  enabled?: boolean;
  ready?: boolean;
}

export const useScrollRestore = (
  ref: RefObject<HTMLElement | null>,
  { enabled = true, ready = true }: UseScrollRestoreOptionsType = {},
) => {
  const dispatch = useAppDispatch();
  const activeTabId = useAppSelector(selectActiveTabId);
  const record = useAppSelector(selectTabRecord(activeTabId));
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleScroll = useCallback(() => {
    if (!enabled || !activeTabId || !ref.current) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    const target = ref.current;

    debounceRef.current = setTimeout(() => {
      dispatch(workspaceTabsActions.setScrollTop({ tabId: activeTabId, scrollTop: target.scrollTop }));
    }, SCROLL_DEBOUNCE_MS);
  }, [activeTabId, dispatch, enabled, ref]);

  useLayoutEffect(() => {
    if (!enabled || !ready || !ref.current || !record) return;

    ref.current.scrollTop = record.scrollTop ?? 0;
  }, [enabled, ready, ref, record]);

  useEffect(() => {
    if (!enabled) return;

    const node = ref.current;

    if (!node) return;

    node.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      node.removeEventListener('scroll', handleScroll);
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [enabled, handleScroll, ref]);
};
