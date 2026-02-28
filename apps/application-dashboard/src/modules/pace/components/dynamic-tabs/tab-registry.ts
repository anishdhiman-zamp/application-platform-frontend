import { ROUTES_PATH } from '@/constants/routeConfig';
import { DynamicTabRouteConfig, DynamicTabType, ROUTE_KIND } from '@/modules/pace/pace.types';

export const TAB_TYPE_CONFIG: Record<DynamicTabType, DynamicTabRouteConfig> = {
  file: {
    kind: ROUTE_KIND.QUERY,
    basePath: ROUTES_PATH.CHAT_FILES,
    paramName: 'f',
    fallbackPath: ROUTES_PATH.CHAT_FILES,
  },
  task: {
    kind: ROUTE_KIND.DYNAMIC,
    basePath: '/chat/tasks',
    buildPath: (id: string) => `/chat/tasks/${encodeURIComponent(id)}`,
    fallbackPath: ROUTES_PATH.CHAT,
  },
};

const DEFAULT_TAB_TYPE: DynamicTabType = 'file';

export const getTabTypeConfig = (type?: DynamicTabType): DynamicTabRouteConfig => {
  return TAB_TYPE_CONFIG[type ?? DEFAULT_TAB_TYPE];
};

export const buildTabRoute = (id: string, type?: DynamicTabType): string => {
  const config = getTabTypeConfig(type);

  if (config.kind === ROUTE_KIND.QUERY) {
    return `${config.basePath}?${config.paramName}=${encodeURIComponent(id)}`;
  }

  return config.buildPath(id);
};

export const getTabFallbackPath = (type?: DynamicTabType): string => {
  const config = getTabTypeConfig(type);

  return config.fallbackPath;
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
