import { GENERAL_ICONS } from './general';
import { ARROW_ICONS } from './arrows';
import { ICON_SPRITE_TYPES } from '@zamp-platform/ui/types';
import { CHARTS } from './charts';
import { COMMUNICATION } from './communication';
import { ALERTS_AND_FEEDBACKS_ICONS } from './alerts-feedbacks';
import { EDITOR } from './editor';
import { EDUCATION } from './education';
import { FILES } from './files';
import { FINANCE_AND_ECOMMERCE } from './finance-ecommerce';
import { LAYOUT_ICONS } from './layout';
import { TIME } from './time';
import { USERS_ICONS } from './users';

// Combine all icon mappings
export const SPRITE_CATEGORY_BY_ID: Record<string, ICON_SPRITE_TYPES> = {
  ...ALERTS_AND_FEEDBACKS_ICONS,
  ...ARROW_ICONS,
  ...CHARTS,
  ...COMMUNICATION,
  ...EDITOR,
  ...EDUCATION,
  ...FILES,
  ...FINANCE_AND_ECOMMERCE,
  ...GENERAL_ICONS,
  ...LAYOUT_ICONS,
  ...TIME,
  ...USERS_ICONS,
};

// Export individual categories for direct access if needed
export {
  GENERAL_ICONS,
  ARROW_ICONS,
  CHARTS,
  COMMUNICATION,
  ALERTS_AND_FEEDBACKS_ICONS,
  EDITOR,
  EDUCATION,
  FILES,
  FINANCE_AND_ECOMMERCE,
  LAYOUT_ICONS,
  TIME,
  USERS_ICONS,
};
