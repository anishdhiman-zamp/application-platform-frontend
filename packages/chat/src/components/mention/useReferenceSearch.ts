import { useDebounce } from '@zamp-platform/utils';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { ReferencePickerAdapter, ReferenceSearchHit } from '../../types/references.types';
import { DEBOUNCE_MS, RECENT_TAB, V1_KINDS } from './constants';

interface UseReferenceSearchParams {
  adapter: ReferencePickerAdapter;
  activeTab: string;
  query: string;
}

interface UseReferenceSearchResult {
  items: ReferenceSearchHit[];
  isLoading: boolean;
}

const interleave = (results: { items: ReferenceSearchHit[] }[]): ReferenceSearchHit[] => {
  const merged: ReferenceSearchHit[] = [];
  const maxLen = Math.max(...results.map((r) => r.items.length), 0);
  for (let i = 0; i < maxLen; i++) {
    for (const r of results) {
      if (r.items[i]) merged.push(r.items[i]);
    }
  }
  return merged;
};

const readEmptyStateItems = (adapter: ReferencePickerAdapter, activeTab: string): ReferenceSearchHit[] => {
  if (activeTab === RECENT_TAB) return adapter.listRecent?.() ?? [];
  return [];
};

export const useReferenceSearch = ({
  adapter,
  activeTab,
  query,
}: UseReferenceSearchParams): UseReferenceSearchResult => {
  const fetchIdRef = useRef(0);
  const debouncedQuery = useDebounce(query, DEBOUNCE_MS);

  const [items, setItems] = useState<ReferenceSearchHit[]>(() => readEmptyStateItems(adapter, activeTab));
  const [shownKey, setShownKey] = useState(() => `${activeTab}::`);

  const markShown = useCallback((tab: string, q: string, next: ReferenceSearchHit[]) => {
    setItems(next);
    setShownKey(`${tab}::${q}`);
  }, []);

  const syncItems = useCallback(async () => {
    const id = ++fetchIdRef.current;

    if (!debouncedQuery) {
      markShown(activeTab, '', readEmptyStateItems(adapter, activeTab));
      return;
    }

    const isRecent = activeTab === RECENT_TAB;
    const kinds = isRecent ? Array.from(V1_KINDS) : [activeTab];
    const results = await Promise.all(
      kinds.map((kind) =>
        adapter.listItems({ kind, q: debouncedQuery }).catch(() => ({ items: [] as ReferenceSearchHit[] })),
      ),
    );
    if (fetchIdRef.current !== id) return;

    markShown(activeTab, debouncedQuery, isRecent ? interleave(results) : results[0].items);
  }, [adapter, activeTab, debouncedQuery, markShown]);

  useEffect(() => {
    syncItems();
  }, [syncItems]);

  const isLoading = shownKey !== `${activeTab}::${query}`;
  return { items, isLoading };
};
