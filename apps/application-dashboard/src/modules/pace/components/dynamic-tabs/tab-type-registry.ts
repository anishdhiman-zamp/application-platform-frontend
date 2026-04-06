import { ROUTES_PATH } from '@/constants/routeConfig';
import { DynamicTabType, ROUTE_KIND, TAB_TYPE } from '@/modules/pace/pace.types';

/**
 * Declarative definition for a dynamic tab type. Each tab type (file, task, etc.)
 * registers one of these to describe how it maps to/from URLs.
 */
export interface TabTypeDefinition {
  kind: typeof ROUTE_KIND.QUERY | typeof ROUTE_KIND.DYNAMIC;
  basePath: string;
  paramName?: string;
  buildPath: (id: string) => string;
  parseId: (pathname: string, search: string) => string | null;
  getDefaultName: (id: string) => string;
}

export const TAB_TYPE_REGISTRY: Record<DynamicTabType, TabTypeDefinition> = {
  [TAB_TYPE.FILE]: {
    kind: ROUTE_KIND.QUERY,
    basePath: ROUTES_PATH.CHAT,
    paramName: 'f',
    buildPath: (id: string) => `${ROUTES_PATH.CHAT}?f=${encodeURIComponent(id)}`,
    parseId: (pathname: string, search: string) => {
      if (pathname !== ROUTES_PATH.CHAT) return null;

      return new URLSearchParams(search).get('f');
    },
    getDefaultName: (id: string) => id.split('/').pop() || id,
  },
  [TAB_TYPE.TASK]: {
    kind: ROUTE_KIND.DYNAMIC,
    basePath: `${ROUTES_PATH.CHAT}/task`,
    buildPath: (id: string) => `${ROUTES_PATH.CHAT}/task/${encodeURIComponent(id)}`,
    parseId: (pathname: string) => {
      const basePath = `${ROUTES_PATH.CHAT}/task`;

      if (!pathname.startsWith(basePath + '/')) return null;

      const baseSegments = basePath.split('/').filter(Boolean);
      const pathSegments = pathname.split('/').filter(Boolean);

      if (pathSegments.length > baseSegments.length) {
        return decodeURIComponent(pathSegments[baseSegments.length]);
      }

      return null;
    },
    getDefaultName: (id: string) => id,
  },
  [TAB_TYPE.AGENT]: {
    kind: ROUTE_KIND.DYNAMIC,
    basePath: ROUTES_PATH.CHAT_AGENTS,
    buildPath: (id: string) => `${ROUTES_PATH.CHAT_AGENTS}/${encodeURIComponent(id)}`,
    parseId: (pathname: string) => {
      const basePath = ROUTES_PATH.CHAT_AGENTS;

      if (!pathname.startsWith(basePath + '/')) return null;

      const baseSegments = basePath.split('/').filter(Boolean);
      const pathSegments = pathname.split('/').filter(Boolean);

      if (pathSegments.length > baseSegments.length) {
        return decodeURIComponent(pathSegments[baseSegments.length]);
      }

      return null;
    },
    getDefaultName: (id: string) => id,
  },
  [TAB_TYPE.BROWSER]: {
    kind: ROUTE_KIND.QUERY,
    basePath: ROUTES_PATH.CHAT,
    paramName: 'b',
    buildPath: (id: string) => `${ROUTES_PATH.CHAT}?b=${encodeURIComponent(id)}`,
    parseId: (pathname: string, search: string) => {
      if (pathname !== ROUTES_PATH.CHAT) return null;

      return new URLSearchParams(search).get('b');
    },
    getDefaultName: () => 'Browser',
  },
};

/**
 * Returns the registry definition for the given tab type, defaulting to FILE.
 * @param type - The tab type to look up. Falls back to `TAB_TYPE.FILE` when omitted.
 */
export const getTabTypeDefinition = (type?: DynamicTabType): TabTypeDefinition => {
  return TAB_TYPE_REGISTRY[type ?? TAB_TYPE.FILE];
};

/**
 * Builds the canonical URL path for a tab, without sidebar params.
 * Sidebar params are applied at navigation time by `useTabRouter`.
 * @param id - The tab identifier (e.g. file path or task id).
 * @param type - The tab type. Defaults to FILE.
 */
export const buildTabRoute = (id: string, type?: DynamicTabType): string => {
  return getTabTypeDefinition(type).buildPath(id);
};

/**
 * Extracts the active tab id from a URL by checking each registered tab type's `parseId`.
 * When `type` is provided, only that type is checked; otherwise all types are tried in order.
 * @param pathname - The URL pathname (e.g. `/chat` or `/chat/task/abc`).
 * @param search - The URL search string (e.g. `?f=readme.md`).
 * @param type - Optional tab type to restrict the lookup to.
 * @returns The matched tab id, or `null` if no tab type matches the URL.
 */
export const getActiveTabIdFromUrl = (pathname: string, search: string, type?: DynamicTabType): string | null => {
  const entries = type
    ? [[type, TAB_TYPE_REGISTRY[type]] as const]
    : (Object.entries(TAB_TYPE_REGISTRY) as [DynamicTabType, TabTypeDefinition][]);

  for (const [, definition] of entries) {
    const id = definition.parseId(pathname, search);

    if (id) return id;
  }

  return null;
};

/**
 * Determines which tab type a URL corresponds to by trying each registered `parseId`.
 * @param pathname - The URL pathname.
 * @param search - The URL search string.
 * @returns The matching `DynamicTabType`, or `null` if the URL doesn't match any tab type.
 */
export const getTabTypeFromUrl = (pathname: string, search: string): DynamicTabType | null => {
  for (const [tabType, definition] of Object.entries(TAB_TYPE_REGISTRY) as [DynamicTabType, TabTypeDefinition][]) {
    const id = definition.parseId(pathname, search);

    if (id) return tabType;
  }

  return null;
};

/**
 * Checks whether the current browser URL and the target path belong to the same
 * tab type's base path. Used to decide between `history.pushState` (same layout,
 * no Next.js transition) and `router.push` (cross-layout, full transition).
 * @param targetPath - The path being navigated to (may include query string).
 * @returns `true` if both current and target URLs resolve under the same tab type base.
 */
export const isSameBasePath = (targetPath: string): boolean => {
  const currentPathname = window.location.pathname;
  const targetUrl = new URL(targetPath, window.location.origin);

  for (const [, definition] of Object.entries(TAB_TYPE_REGISTRY)) {
    const currentId = definition.parseId(currentPathname, window.location.search);
    const targetId = definition.parseId(targetUrl.pathname, targetUrl.search);

    if (currentId !== null && targetId !== null) return true;

    if (definition.kind === ROUTE_KIND.QUERY) {
      const onCurrent = currentPathname === definition.basePath;
      const onTarget = targetUrl.pathname === definition.basePath;

      if (onCurrent && onTarget) return true;
    } else {
      const onCurrent = currentPathname.startsWith(`${definition.basePath}/`);
      const onTarget = targetUrl.pathname.startsWith(`${definition.basePath}/`);

      if (onCurrent && onTarget) return true;
    }
  }

  return false;
};

/**
 * Returns `true` if the given pathname matches any registered tab type's base path.
 * Useful for determining whether the user is currently viewing a dynamic tab route.
 * @param pathname - The URL pathname to check.
 */
export const isOnAnyTabBasePath = (pathname: string): boolean => {
  for (const [, definition] of Object.entries(TAB_TYPE_REGISTRY)) {
    if (definition.kind === ROUTE_KIND.QUERY && pathname === definition.basePath) return true;
    if (definition.kind === ROUTE_KIND.DYNAMIC && pathname.startsWith(`${definition.basePath}/`)) return true;
  }

  return false;
};
