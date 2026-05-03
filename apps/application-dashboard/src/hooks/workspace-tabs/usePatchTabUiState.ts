import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from 'hooks/toolkit';
import { selectActiveTabId, workspaceTabsActions } from '@/store/slices/workspace-tabs.slice';
import type { TabIdType } from '@/types/workspace-tabs.types';

export const usePatchTabUiState = (tabId?: TabIdType | null) => {
  const dispatch = useAppDispatch();
  const activeTabId = useAppSelector(selectActiveTabId);
  const targetTabId = tabId ?? activeTabId;

  const patch = useCallback(
    (next: Record<string, unknown>) => {
      if (!targetTabId) return;

      dispatch(workspaceTabsActions.patchTabUiState({ tabId: targetTabId, patch: next }));
    },
    [dispatch, targetTabId],
  );

  return { tabId: targetTabId, patch };
};
