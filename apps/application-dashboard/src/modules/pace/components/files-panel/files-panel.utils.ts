import { ROUTES_PATH } from '@/constants/routeConfig';
import { SINGLE_VIEWER_TAB_METADATA_KEY } from '@/modules/pace/pace.constants';
import type { DynamicTab } from '@/modules/pace/pace.types';
import { TAB_TYPE } from '@/modules/pace/pace.types';

export const isSingleViewerTab = (tab: DynamicTab | null | undefined): boolean => {
  return Boolean(tab?.metadata?.[SINGLE_VIEWER_TAB_METADATA_KEY]);
};

export const shouldUseSingleViewerMode = (pathname: string | null, activeTab: DynamicTab | null): boolean => {
  if (pathname === ROUTES_PATH.CHAT_TASK) return true;
  if (isSingleViewerTab(activeTab)) return true;

  const activeTabType = activeTab?.type ?? TAB_TYPE.FILE;

  return activeTabType === TAB_TYPE.TASK || activeTabType === TAB_TYPE.AGENT;
};
