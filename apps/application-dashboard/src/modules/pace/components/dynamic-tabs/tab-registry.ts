import { SIDEBAR_CONVERSATION_ID_PARAM } from 'modules/pace/pace.constants';
import { ROUTES_PATH } from '@/constants/routeConfig';
import { DynamicTabRouteConfig, DynamicTabType, ROUTE_KIND, TAB_TYPE } from '@/modules/pace/pace.types';

const buildUrl = (basePath: string, params: URLSearchParams): string => {
  const query = params.toString();

  return query ? `${basePath}?${query}` : basePath;
};

/**
 * Syncs the sidebar conversation param with the current URL state.
 * - Strips any stale sidebar param from the stored path
 * - Adds the current sidebar param from URL (if open)
 */
export const preserveSidebarParam = (path: string): string => {
  if (typeof window === 'undefined') return path;

  const [basePath, existingQuery] = path.split('?');
  const params = new URLSearchParams(existingQuery || '');
  const currentSidebarId = new URLSearchParams(window.location.search).get(SIDEBAR_CONVERSATION_ID_PARAM);

  params.delete(SIDEBAR_CONVERSATION_ID_PARAM);

  if (currentSidebarId) {
    params.set(SIDEBAR_CONVERSATION_ID_PARAM, currentSidebarId);
  }

  return buildUrl(basePath, params);
};

export const TAB_TYPE_CONFIG: Record<DynamicTabType, DynamicTabRouteConfig> = {
  [TAB_TYPE.FILE]: {
    kind: ROUTE_KIND.QUERY,
    basePath: ROUTES_PATH.CHAT_FILES,
    paramName: 'f',
    fallbackPath: ROUTES_PATH.CHAT_FILES,
  },
  [TAB_TYPE.TASK]: {
    kind: ROUTE_KIND.DYNAMIC,
    basePath: '/chat/tasks',
    buildPath: (id: string) => `/chat/tasks/${encodeURIComponent(id)}`,
    fallbackPath: ROUTES_PATH.CHAT,
  },
};

const DEFAULT_TAB_TYPE: DynamicTabType = TAB_TYPE.FILE;

export const getTabTypeConfig = (type?: DynamicTabType): DynamicTabRouteConfig => {
  return TAB_TYPE_CONFIG[type ?? DEFAULT_TAB_TYPE];
};

export const buildTabRoute = (id: string, type?: DynamicTabType): string => {
  const config = getTabTypeConfig(type);
  let path: string;

  if (config.kind === ROUTE_KIND.QUERY) {
    path = `${config.basePath}?${config.paramName}=${encodeURIComponent(id)}`;
  } else {
    path = config.buildPath(id);
  }

  return preserveSidebarParam(path);
};

export const getTabFallbackPath = (type?: DynamicTabType): string => {
  const config = getTabTypeConfig(type);

  return preserveSidebarParam(config.fallbackPath);
};

export const isOnSameBasePath = (type?: DynamicTabType): boolean => {
  if (typeof window === 'undefined') return false;

  const config = getTabTypeConfig(type);
  const currentPath = window.location.pathname;

  if (config.kind === ROUTE_KIND.QUERY) {
    return currentPath === config.basePath;
  }

  return currentPath.startsWith(config.basePath);
};

export const getActiveTabIdFromUrl = (type: DynamicTabType): string | null => {
  if (typeof window === 'undefined') return null;

  const config = TAB_TYPE_CONFIG[type];

  if (config.kind === ROUTE_KIND.QUERY) {
    const params = new URLSearchParams(window.location.search);

    return params.get(config.paramName);
  }

  const pathSegments = window.location.pathname.split('/');
  const baseSegments = config.basePath.split('/').filter(Boolean);

  if (pathSegments.length > baseSegments.length + 1) {
    return decodeURIComponent(pathSegments[baseSegments.length + 1]);
  }

  return null;
};
