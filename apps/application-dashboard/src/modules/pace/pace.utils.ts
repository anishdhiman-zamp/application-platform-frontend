import {
  AFTERNOON_GREETINGS,
  EVENING_GREETINGS,
  MORNING_GREETINGS,
  NIGHT_GREETINGS,
  SIDEBAR_CONVERSATION_ID_PARAM,
} from 'modules/pace/pace.constants';
import { DynamicTab, TAB_TYPE } from 'modules/pace/pace.types';
import type { SkillApiError } from '@/types/api/skills.types';
import { getFromLocalStorage, LOCAL_STORAGE_KEYS, setToLocalStorage } from '@/utils/localstorage';

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
 * Retrieves persisted dynamic tabs from local storage, ensuring each tab
 * has a stable key and a default type.
 * @returns The array of stored dynamic tabs, or an empty array on failure
 */
export const getStoredTabs = (): DynamicTab[] => {
  try {
    const stored = getFromLocalStorage(LOCAL_STORAGE_KEYS.PACE_OPEN_DYNAMIC_TABS);

    if (!stored) return [];
    const tabs = JSON.parse(stored) as DynamicTab[];

    return tabs.map((tab) => ({
      ...tab,
      stableKey: tab.stableKey || crypto.randomUUID(),
      type: tab.type ?? TAB_TYPE.FILE,
    }));
  } catch (error) {
    console.error('Error getting stored tabs:', error);

    return [];
  }
};

/**
 * Persists the current dynamic tabs array to local storage.
 * @param tabs - The dynamic tabs to store
 */
export const setStoredTabs = (tabs: DynamicTab[]) => {
  try {
    setToLocalStorage(LOCAL_STORAGE_KEYS.PACE_OPEN_DYNAMIC_TABS, JSON.stringify(tabs));
  } catch (error) {
    console.error('Error setting stored tabs:', error);
  }
};
