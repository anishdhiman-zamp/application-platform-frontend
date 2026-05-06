import { ROUTES_PATH } from '@/constants/routeConfig';
import { SIDEBAR_CONVERSATION_ID_PARAM } from '@/modules/pace/pace.constants';
import { type ResolveTabType, TAB_KIND, type TabIdType } from '@/types/workspace-tabs.types';

const SETTINGS_PREFIX = '/chat/settings';

const buildChatTabId = (conversationId: string | null | undefined): TabIdType =>
  conversationId ? `chat:${conversationId}` : 'chat:new';

const settingsInstanceFromPath = (pathname: string): string => {
  const trimmed = pathname.replace(SETTINGS_PREFIX, '').replace(/^\/+/, '');
  const segment = trimmed.split('/')[0];

  return segment || 'general';
};

export const routeToTab = (pathname: string | null, search?: URLSearchParams | null): ResolveTabType | null => {
  if (!pathname) return null;

  if (pathname.startsWith(SETTINGS_PREFIX)) {
    const instanceId = settingsInstanceFromPath(pathname);

    return { tabId: `settings:${instanceId}`, kind: TAB_KIND.SETTINGS, instanceId };
  }

  if (pathname.startsWith(ROUTES_PATH.CHAT_TASK)) {
    return { tabId: 'tasks', kind: TAB_KIND.TASKS };
  }

  if (pathname.startsWith(ROUTES_PATH.CHAT_AGENTS)) {
    return { tabId: 'agents', kind: TAB_KIND.AGENTS };
  }

  if (pathname.startsWith(ROUTES_PATH.CHAT_APPS)) {
    return { tabId: 'apps', kind: TAB_KIND.APPS };
  }

  if (pathname.startsWith(ROUTES_PATH.CHAT_FILES)) {
    return { tabId: 'files', kind: TAB_KIND.FILES };
  }

  if (pathname.startsWith('/chat/history')) {
    return { tabId: 'history', kind: TAB_KIND.HISTORY };
  }

  if (pathname.startsWith(ROUTES_PATH.CHAT_DATASET)) {
    const tableName = search?.get('dataset') ?? undefined;

    return { tabId: tableName ? `dataset:${tableName}` : 'dataset', kind: TAB_KIND.DATASET, instanceId: tableName };
  }

  if (pathname === ROUTES_PATH.CHAT) {
    const conversationId = search?.get(SIDEBAR_CONVERSATION_ID_PARAM) ?? null;

    return { tabId: buildChatTabId(conversationId), kind: TAB_KIND.CHAT, instanceId: conversationId ?? undefined };
  }

  return null;
};

export const defaultRouteForTab = (tabId: TabIdType): string => {
  if (!tabId) return ROUTES_PATH.CHAT;

  if (tabId === 'tasks') return ROUTES_PATH.CHAT_TASK;
  if (tabId === 'agents') return ROUTES_PATH.CHAT_AGENTS;
  if (tabId === 'apps') return ROUTES_PATH.CHAT_APPS;
  if (tabId === 'files') return ROUTES_PATH.CHAT_FILES;
  if (tabId === 'history') return '/chat/history';
  if (tabId === 'dataset') return ROUTES_PATH.CHAT_DATASET;

  if (tabId.startsWith('dataset:')) {
    const tableName = tabId.slice('dataset:'.length);

    return `${ROUTES_PATH.CHAT_DATASET}?dataset=${encodeURIComponent(tableName)}`;
  }

  if (tabId.startsWith('settings:')) {
    const section = tabId.slice('settings:'.length);

    if (section === 'general') return ROUTES_PATH.CHAT_SETTINGS_GENERAL;
    if (section === 'integrations') return ROUTES_PATH.CHAT_SETTINGS_INTEGRATIONS;
    if (section === 'people') return ROUTES_PATH.CHAT_SETTINGS_PEOPLE;
    if (section === 'datasets') return ROUTES_PATH.CHAT_SETTINGS_DATASETS;
    if (section === 'organisation-settings') return ROUTES_PATH.CHAT_SETTINGS_ORG_SETTINGS;
    if (section === 'credentials-vault') return ROUTES_PATH.CHAT_SETTINGS_CREDENTIALS_VAULT;
    if (section === 'design-system') return ROUTES_PATH.CHAT_SETTINGS_DESIGN_SYSTEM;

    return ROUTES_PATH.CHAT_SETTINGS;
  }

  if (tabId.startsWith('chat:')) {
    const conversationId = tabId.slice('chat:'.length);

    if (!conversationId || conversationId === 'new') return ROUTES_PATH.CHAT;

    return `${ROUTES_PATH.CHAT}?${SIDEBAR_CONVERSATION_ID_PARAM}=${encodeURIComponent(conversationId)}`;
  }

  return ROUTES_PATH.CHAT;
};

const isSubRouteForBaseRoute = (subRoute: string | undefined, baseRoute: string): subRoute is string => {
  if (!subRoute) return false;
  if (subRoute === baseRoute) return true;

  if (baseRoute.includes('?')) {
    return subRoute.startsWith(`${baseRoute}&`) || subRoute.startsWith(`${baseRoute}#`);
  }

  return subRoute.startsWith(`${baseRoute}?`) || subRoute.startsWith(`${baseRoute}/`);
};

export const routeForTab = (tabId: TabIdType, lastSubRoute?: string): string => {
  const fallbackRoute = defaultRouteForTab(tabId);

  return isSubRouteForBaseRoute(lastSubRoute, fallbackRoute) ? lastSubRoute : fallbackRoute;
};
