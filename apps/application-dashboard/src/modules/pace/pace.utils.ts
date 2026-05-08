import { MENTION_KIND, type ReferenceSearchHit } from '@zamp-platform/chat';
import {
  AFTERNOON_GREETINGS,
  AGENTS_LISTING_CONVERSATION_ID,
  EVENING_GREETINGS,
  FILES_LISTING_CONVERSATION_ID,
  MORNING_GREETINGS,
  NEW_CONVERSATION_ID,
  NIGHT_GREETINGS,
  SIDEBAR_CONVERSATION_ID_PARAM,
  TASKS_LISTING_CONVERSATION_ID,
} from 'modules/pace/pace.constants';
import {
  CHAT_SIDEBAR_STATE,
  type ChatSidebarState,
  type DynamicTab,
  TAB_QUERY_PARAM,
  TAB_TYPE,
} from 'modules/pace/pace.types';
import { ROUTES_PATH } from '@/constants/routeConfig';
import type { SkillApiError } from '@/types/api/skills.types';
import { getFromLocalStorage, LOCAL_STORAGE_KEYS } from '@/utils/localstorage';

/**
 * Reads a numeric value from localStorage and clamps it within [min, max].
 * Falls back to `fallback` if the value is missing, NaN, or non-positive.
 * Safe to call server-side — returns `fallback` when `window` is unavailable.
 * @param key - The localStorage key to read
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @param fallback - Default value when nothing is stored or the value is invalid
 */
export const getInitialWidth = (key: LOCAL_STORAGE_KEYS, min: number, max: number, fallback: number): number => {
  if (typeof window === 'undefined') return fallback;
  const stored = Number(localStorage.getItem(key));

  return !Number.isNaN(stored) && stored > 0 ? Math.min(max, Math.max(min, stored)) : fallback;
};

/**
 * Derives the correct chat sidebar state from the current URL on first render,
 * avoiding the COLLAPSED → open flash that occurs when state is corrected in a useEffect.
 * Safe to call server-side — returns COLLAPSED when `window` is unavailable.
 *
 * Rules:
 * - Any non-chat route (anything other than exactly `/chat`) → always COLLAPSED
 * - No sidebar conversation param → COLLAPSED
 * - `/chat` root with no tab param (file/agent/browser/etc.) → EXPANDED (full-screen)
 * - `/chat` root with sidebar param and persisted COLLAPSED → SIDEBAR (conversation is open)
 * - Persisted EXPANDED state with sidebar param → EXPANDED (survives refresh)
 */
export const getInitialSidebarState = (): ChatSidebarState => {
  if (typeof window === 'undefined') return CHAT_SIDEBAR_STATE.COLLAPSED;

  if (window.location.pathname !== ROUTES_PATH.CHAT) return CHAT_SIDEBAR_STATE.COLLAPSED;

  const search = new URLSearchParams(window.location.search);

  if (!search.has(SIDEBAR_CONVERSATION_ID_PARAM)) return CHAT_SIDEBAR_STATE.COLLAPSED;

  const hasAnyTabParam = Object.values(TAB_QUERY_PARAM).some((param) => search.has(param));
  const isChatRoot = window.location.pathname === ROUTES_PATH.CHAT && !hasAnyTabParam;

  if (isChatRoot) return CHAT_SIDEBAR_STATE.EXPANDED;

  const persistedChatSidebarState = getFromLocalStorage(
    LOCAL_STORAGE_KEYS.PACE_SIDEBAR_STATE,
  ) as ChatSidebarState | null;

  return persistedChatSidebarState || CHAT_SIDEBAR_STATE.SIDEBAR;
};

export const hasTabParam = (searchParams: URLSearchParams): boolean =>
  Object.values(TAB_QUERY_PARAM).some((param) => searchParams.has(param));

/**
 * Maps the current route to the dynamic-tabs conversation bucket it should use.
 * Chat tab URLs without an existing sidebar conversation need a durable pending
 * bucket so right-panel tabs can exist before the first message creates a real conversation.
 */
export const getRouteConversationId = (
  pathname: string | null,
  searchParams: URLSearchParams | null,
): string | null => {
  const path = pathname ?? '';
  const params = searchParams ?? new URLSearchParams();

  if (path === ROUTES_PATH.CHAT) {
    const sidebarConversationId = params.get(SIDEBAR_CONVERSATION_ID_PARAM);

    if (sidebarConversationId) return sidebarConversationId;

    return hasTabParam(params) ? NEW_CONVERSATION_ID : null;
  }

  if (path === ROUTES_PATH.CHAT_FILES) return FILES_LISTING_CONVERSATION_ID;
  if (path === ROUTES_PATH.CHAT_TASK) return TASKS_LISTING_CONVERSATION_ID;
  if (path === ROUTES_PATH.CHAT_AGENTS) return AGENTS_LISTING_CONVERSATION_ID;

  return null;
};

/** Returns a random element from the given array */
const pickRandom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

/**
 * Returns a varied greeting based on time of day
 * Morning: 5am - 12pm | Afternoon: 12pm - 5pm | Evening: 5pm - 9pm | Night: 9pm - 5am
 */
export const getGreeting = (): string => {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) return pickRandom(MORNING_GREETINGS);
  if (hour >= 12 && hour < 17) return pickRandom(AFTERNOON_GREETINGS);
  if (hour >= 17 && hour < 21) return pickRandom(EVENING_GREETINGS);

  return pickRandom(NIGHT_GREETINGS);
};

/**
 * Checks if the error is a skill name conflict (duplicate name)
 * @param error - The error from the API call
 * @returns The conflicting skill name if it's a conflict error, null otherwise
 */
export function getConflictingSkillName(error: unknown): string | null {
  const apiError = (error as { data?: SkillApiError })?.data;
  const details = apiError?.details;

  return details?.skill_name || null;
}

/**
 * Normalizes a URL path by decoding URI components and handling different space encodings.
 * Converts '+' to space before decoding to handle both %20 and + space representations.
 * @param str - The URL path string to normalize
 * @returns The normalized, decoded string
 */
export const normalizeUrlPath = (str: string): string => {
  if (!str) return '';
  try {
    return decodeURIComponent(str.replace(/\+/g, ' '));
  } catch {
    return str;
  }
};

/**
 * Syncs the sidebar conversation param with the current URL state.
 * - Strips any stale sidebar param from the given path
 * - Adds the current sidebar param from the URL (if present)
 * Safe to call server-side (returns the path unchanged when `window` is unavailable).
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

  const query = params.toString();

  return query ? `${basePath}?${query}` : basePath;
};

/**
 * Builds a URL string from the pathname and search params, excluding the sidebar conversation ID param.
 * Used to track meaningful route changes without reacting to sidebar-only navigation.
 * @param pathname - The current route pathname
 * @param searchParams - The current URL search params
 * @returns The constructed URL string without the sidebar conversation param
 */
export const getRouteSignificantUrl = (pathname: string | null, searchParams: URLSearchParams | null): string => {
  const path = pathname ?? '';

  if (!searchParams) return path;
  const filtered = new URLSearchParams(searchParams);

  filtered.delete(SIDEBAR_CONVERSATION_ID_PARAM);

  const query = filtered.toString();

  return query ? `${path}?${query}` : path;
};

/**
 * Builds a list of recent hits from the given dynamic tabs.
 * @param dynamicTabs - The dynamic tabs to build the recent hits from
 * @returns The list of recent hits
 */
export const buildRecentHits = (dynamicTabs: DynamicTab[]): ReferenceSearchHit[] => {
  const hits: ReferenceSearchHit[] = [];

  for (let i = dynamicTabs.length - 1; i >= 0; i--) {
    const tab = dynamicTabs[i];
    const type = tab.type ?? TAB_TYPE.FILE;

    if (type !== TAB_TYPE.FILE && type !== TAB_TYPE.DATASET && type !== TAB_TYPE.TASK) continue;

    if (type === TAB_TYPE.TASK) {
      hits.push({
        kind: MENTION_KIND.TASK,
        resource_id: tab.id,
        display_label: tab.name,
        icon_hint: 'task',
      });
      continue;
    }

    const isDataset = type === TAB_TYPE.DATASET;
    const dot = tab.name.lastIndexOf('.');
    const extension = dot > 0 && dot < tab.name.length - 1 ? tab.name.slice(dot + 1) : '';

    hits.push({
      kind: isDataset ? MENTION_KIND.DATASET : MENTION_KIND.FILE,
      resource_id: tab.id,
      display_label: tab.name,
      icon_hint: isDataset ? 'tables' : extension,
    });
  }

  return hits;
};
