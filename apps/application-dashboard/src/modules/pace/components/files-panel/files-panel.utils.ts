import { ROUTES_PATH } from '@/constants/routeConfig';
import { SINGLE_VIEWER_TAB_METADATA_KEY } from '@/modules/pace/pace.constants';
import type { DynamicTab } from '@/modules/pace/pace.types';
import { TAB_TYPE } from '@/modules/pace/pace.types';

export type PanelHostSurface = 'chat' | 'files' | 'tasks' | 'agents' | null;
export type TaskContentChrome = 'panel' | 'inline' | 'none';

export const getPanelHostSurface = (pathname: string | null): PanelHostSurface => {
  if (pathname === ROUTES_PATH.CHAT) return 'chat';
  if (pathname === ROUTES_PATH.CHAT_FILES) return 'files';
  if (pathname === ROUTES_PATH.CHAT_TASK) return 'tasks';
  if (pathname === ROUTES_PATH.CHAT_AGENTS) return 'agents';

  return null;
};

export const isChatPanelSurface = (pathname: string | null): boolean => getPanelHostSurface(pathname) === 'chat';

export const isListingPanelSurface = (pathname: string | null): boolean => {
  const surface = getPanelHostSurface(pathname);

  return surface === 'files' || surface === 'tasks' || surface === 'agents';
};

export const isSingleViewerTab = (tab: DynamicTab | null | undefined): boolean => {
  return Boolean(tab?.metadata?.[SINGLE_VIEWER_TAB_METADATA_KEY]);
};

export const shouldUseSingleViewerMode = (pathname: string | null, activeTab: DynamicTab | null): boolean => {
  if (isChatPanelSurface(pathname)) return false;
  if (isListingPanelSurface(pathname)) return true;
  if (isSingleViewerTab(activeTab)) return true;

  const activeTabType = activeTab?.type ?? TAB_TYPE.FILE;

  return activeTabType === TAB_TYPE.TASK || activeTabType === TAB_TYPE.AGENT;
};

export const shouldHideFilesPanelTopBar = (pathname: string | null, activeTab: DynamicTab | null): boolean => {
  if (!activeTab || !shouldUseSingleViewerMode(pathname, activeTab)) return false;

  const activeTabType = activeTab.type ?? TAB_TYPE.FILE;

  return (
    activeTabType === TAB_TYPE.TASK ||
    activeTabType === TAB_TYPE.AGENT ||
    (activeTabType === TAB_TYPE.FILE && isListingPanelSurface(pathname))
  );
};

export const getTaskContentChrome = (pathname: string | null): TaskContentChrome => {
  if (isChatPanelSurface(pathname)) return 'none';
  if (isListingPanelSurface(pathname)) return 'panel';

  return 'inline';
};
