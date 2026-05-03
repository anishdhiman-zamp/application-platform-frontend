import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from 'hooks/toolkit';
import { selectActiveTabId, selectRightPanel, workspaceTabsActions } from '@/store/slices/workspace-tabs.slice';
import type { TabIdType, TabRightPanelStateType } from '@/types/workspace-tabs.types';

export const useTabRightPanel = (tabId?: TabIdType | null) => {
  const dispatch = useAppDispatch();
  const activeTabId = useAppSelector(selectActiveTabId);
  const targetTabId = tabId ?? activeTabId;
  const panel = useAppSelector(selectRightPanel(targetTabId));

  const setPanel = useCallback(
    (next: TabRightPanelStateType | undefined) => {
      if (!targetTabId) return;

      dispatch(workspaceTabsActions.setRightPanel({ tabId: targetTabId, panel: next }));
    },
    [dispatch, targetTabId],
  );

  return { tabId: targetTabId, panel, setPanel };
};
