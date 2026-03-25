import { ROUTES_PATH } from '@/constants/routeConfig';
import { DynamicTabRouteConfig, DynamicTabType, ROUTE_KIND, TAB_TYPE } from '@/modules/pace/pace.types';
import { preserveSidebarParam } from '@/modules/pace/pace.utils';

export const TAB_TYPE_CONFIG: Record<DynamicTabType, DynamicTabRouteConfig> = {
  [TAB_TYPE.FILE]: {
    kind: ROUTE_KIND.QUERY,
    basePath: ROUTES_PATH.CHAT,
    paramName: 'f',
    fallbackPath: ROUTES_PATH.CHAT,
  },
  [TAB_TYPE.TASK]: {
    kind: ROUTE_KIND.DYNAMIC,
    basePath: `${ROUTES_PATH.CHAT}/task`,
    buildPath: (id: string) => `${ROUTES_PATH.CHAT}/task/${encodeURIComponent(id)}`,
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

  if (config.kind === ROUTE_KIND.DYNAMIC) {
    return config.fallbackPath;
  }

  return preserveSidebarParam(config.fallbackPath);
};

export const getActiveTabIdFromUrl = (pathname: string, search: string, type: DynamicTabType): string | null => {
  const config = TAB_TYPE_CONFIG[type];

  if (config.kind === ROUTE_KIND.QUERY) {
    return new URLSearchParams(search).get(config.paramName) ?? null;
  }

  const baseSegments = config.basePath.split('/').filter(Boolean);
  const pathSegments = pathname.split('/').filter(Boolean);

  if (pathSegments.length > baseSegments.length) {
    return decodeURIComponent(pathSegments[baseSegments.length]);
  }

  return null;
};

export const getActiveTabIdFromAllConfigsUrl = (pathname: string, search: string): string | null => {
  const params = new URLSearchParams(search);

  for (const [, config] of Object.entries(TAB_TYPE_CONFIG)) {
    if (config.kind === ROUTE_KIND.QUERY) {
      if (pathname === config.basePath || pathname.startsWith(config.basePath + '/')) {
        const paramValue = params.get(config.paramName);

        if (paramValue) return paramValue;
      }
    } else if (config.kind === ROUTE_KIND.DYNAMIC) {
      if (pathname.startsWith(config.basePath + '/')) {
        const baseSegments = config.basePath.split('/').filter(Boolean);
        const pathSegments = pathname.split('/').filter(Boolean);

        if (pathSegments.length > baseSegments.length) {
          return decodeURIComponent(pathSegments[baseSegments.length]);
        }
      }
    }
  }

  return null;
};

export const isOnBasePath = (pathname: string, type: DynamicTabType): boolean => {
  const config = getTabTypeConfig(type);

  if (config.kind === ROUTE_KIND.QUERY) {
    return pathname === config.basePath;
  }

  return pathname.startsWith(`${config.basePath}/`);
};

export const isSameBasePath = (targetPath: string): boolean => {
  const currentPathname = window.location.pathname;
  const targetUrl = new URL(targetPath, window.location.origin);

  for (const [, config] of Object.entries(TAB_TYPE_CONFIG)) {
    const onCurrentBase =
      config.kind === ROUTE_KIND.QUERY
        ? currentPathname === config.basePath
        : currentPathname.startsWith(`${config.basePath}/`);
    const onTargetBase =
      config.kind === ROUTE_KIND.QUERY
        ? targetUrl.pathname === config.basePath
        : targetUrl.pathname.startsWith(`${config.basePath}/`);

    if (onCurrentBase && onTargetBase) return true;
  }

  return false;
};

/**
 * Checks if the current path is on any of the tab base paths.
 */
export const isOnAnyTabBasePath = (pathname: string): boolean => {
  for (const [, config] of Object.entries(TAB_TYPE_CONFIG)) {
    if (config.kind === ROUTE_KIND.QUERY && pathname === config.basePath) return true;
    if (config.kind === ROUTE_KIND.DYNAMIC && pathname.startsWith(`${config.basePath}/`)) return true;
  }

  return false;
};
