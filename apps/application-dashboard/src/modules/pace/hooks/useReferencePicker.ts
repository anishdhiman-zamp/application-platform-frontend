'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { type ReferencePickerAdapter, type ReferenceSearchHit } from '@zamp-platform/chat';
import References from '@/apis/references';
import { useAppDispatch, useAppSelector } from '@/hooks/toolkit';
import { buildRecentHits } from '@/modules/pace/pace.utils';
import { selectDynamicTabs } from '@/store/slices/dynamic-tabs.slice';

export const useReferencePicker = (): ReferencePickerAdapter => {
  const dispatch = useAppDispatch();
  const recentHitsRef = useRef<ReferenceSearchHit[]>([]);

  const dynamicTabs = useAppSelector(selectDynamicTabs);

  // Synchronous read via ref — the popover needs recent items on mount without awaiting a render cycle.
  const listRecent = useCallback(() => recentHitsRef.current, []);

  const listKinds = useCallback(
    () =>
      dispatch(
        References.endpoints.getReferenceKinds.initiate(undefined, {
          subscribe: false,
        }),
      ).unwrap(),
    [dispatch],
  );

  const listItems = useCallback(
    async ({ kind, q, limit }: { kind: string; q?: string; limit?: number }) => {
      const result = await dispatch(
        References.endpoints.getReferenceList.initiate(
          { kind, q, limit },
          {
            subscribe: false,
          },
        ),
      )
        .unwrap()
        .catch(() => ({ items: [] as ReferenceSearchHit[], generation: undefined }));

      return { items: result.items, generation: result.generation };
    },
    [dispatch],
  );

  // Mirror Redux tabs into a ref so listRecent() can return them without an async read.
  useEffect(() => {
    recentHitsRef.current = buildRecentHits(dynamicTabs);
  }, [dynamicTabs]);

  return useMemo(() => ({ listKinds, listItems, listRecent }), [listKinds, listItems, listRecent]);
};

export default useReferencePicker;
