import { APP_PLACEHOLDER_PROMPTS } from '@/modules/apps/apps.constants';

/**
 * Returns a random placeholder prompt for the create app modal.
 */
export const getRandomPrompt = () =>
  APP_PLACEHOLDER_PROMPTS[Math.floor(Math.random() * APP_PLACEHOLDER_PROMPTS.length)];
