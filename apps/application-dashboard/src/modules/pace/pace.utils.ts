import type { SkillApiError } from '@/types/api/skills.types';

interface Greeting {
  text: string;
  includeName: boolean;
}

const MORNING_GREETINGS: Greeting[] = [
  { text: 'Good morning', includeName: true },
  { text: "Let's get things done today", includeName: false },
  { text: 'Ready when you are', includeName: false },
  { text: 'What can I help you with?', includeName: false },
  { text: "Let's make today productive", includeName: false },
];

const AFTERNOON_GREETINGS: Greeting[] = [
  { text: 'Good afternoon', includeName: true },
  { text: 'How can I help?', includeName: false },
  { text: 'Ready to assist', includeName: false },
  { text: "What's on your mind?", includeName: false },
  { text: "Let's keep the momentum going", includeName: false },
];

const EVENING_GREETINGS: Greeting[] = [
  { text: 'Good evening', includeName: true },
  { text: 'Still here for you', includeName: false },
  { text: 'How can I help?', includeName: false },
  { text: 'Ready when you are', includeName: false },
  { text: "Let's wrap up some tasks", includeName: false },
];

const NIGHT_GREETINGS: Greeting[] = [
  { text: "I'm here whenever you need", includeName: false },
  { text: 'Always on, always ready', includeName: false },
  { text: 'Working around the clock', includeName: false },
  { text: 'How can I help tonight?', includeName: false },
  { text: 'Ready to assist', includeName: false },
];

/**
 * Returns a varied greeting based on time of day
 * Morning: 5am - 12pm | Afternoon: 12pm - 5pm | Evening: 5pm - 9pm | Night: 9pm - 5am
 * @param userName - Optional user name to include in greeting
 * @returns string - A complete greeting phrase
 */
export const getGreeting = (userName?: string): string => {
  const hour = new Date().getHours();
  const randomIndex = Math.floor(Math.random() * 5);

  let greeting: Greeting;

  if (hour >= 5 && hour < 12) {
    greeting = MORNING_GREETINGS[randomIndex];
  } else if (hour >= 12 && hour < 17) {
    greeting = AFTERNOON_GREETINGS[randomIndex];
  } else if (hour >= 17 && hour < 21) {
    greeting = EVENING_GREETINGS[randomIndex];
  } else {
    greeting = NIGHT_GREETINGS[randomIndex];
  }

  if (greeting.includeName && userName) {
    return `${greeting.text}, ${userName}`;
  }

  return greeting.text;
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
