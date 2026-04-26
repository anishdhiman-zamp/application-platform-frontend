'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { type ReferencePickerAdapter, type ReferenceSearchHit } from '@zamp-platform/chat';
import { useLazyGetReferenceKindsQuery, useLazyGetReferenceListQuery } from '@/apis/references';
import { useAppSelector } from '@/hooks/toolkit';
import { buildRecentHits } from '@/modules/pace/pace.utils';
import { selectDynamicTabs } from '@/store/slices/dynamic-tabs.slice';

export const useReferencePicker = (): ReferencePickerAdapter => {
  const recentHitsRef = useRef<ReferenceSearchHit[]>([]);

  const [triggerKinds] = useLazyGetReferenceKindsQuery();
  const [triggerList] = useLazyGetReferenceListQuery();

  const dynamicTabs = useAppSelector(selectDynamicTabs);

  // Synchronous read via ref — the popover needs recent items on mount without awaiting a render cycle.
  const listRecent = useCallback(() => recentHitsRef.current, []);

  // List the kinds.
  const listKinds = useCallback(() => triggerKinds(undefined, true).unwrap(), [triggerKinds]);

  const listItems = useCallback(
    async ({ kind, q, limit }: { kind: string; q?: string; limit?: number }) => {
      const result = await triggerList({ kind, q, limit }, true)
        .unwrap()
        .catch(() => ({ items: [] as ReferenceSearchHit[], generation: undefined }));

      return { items: result.items, generation: result.generation };
    },
    [triggerList],
  );

  // Mirror Redux tabs into a ref so listRecent() can return them without an async read.
  useEffect(() => {
    recentHitsRef.current = buildRecentHits(dynamicTabs);
  }, [dynamicTabs]);

  return useMemo(() => ({ listKinds, listItems, listRecent }), [listKinds, listItems, listRecent]);
};

export default useReferencePicker;
