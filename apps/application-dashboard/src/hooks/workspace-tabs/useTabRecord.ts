import { useAppSelector } from 'hooks/toolkit';
import { selectActiveTabRecord, selectTabRecord } from '@/store/slices/workspace-tabs.slice';
import type { TabIdType } from '@/types/workspace-tabs.types';

export const useTabRecord = (tabId: TabIdType | null) => {
  return useAppSelector(selectTabRecord(tabId));
};

export const useActiveTabRecord = () => {
  return useAppSelector(selectActiveTabRecord);
};
