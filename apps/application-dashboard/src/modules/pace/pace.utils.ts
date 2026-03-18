import {
  AFTERNOON_GREETINGS,
  EVENING_GREETINGS,
  MORNING_GREETINGS,
  NIGHT_GREETINGS,
} from '@/modules/pace/pace.constants';
import type { SkillApiError } from '@/types/api/skills.types';

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
