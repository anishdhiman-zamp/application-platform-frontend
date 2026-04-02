/** Sentinel option ids for approval answers (not sent to API). */
export const HITL_APPROVAL_YES = '__hitl_approval_yes__';
export const HITL_APPROVAL_NO = '__hitl_approval_no__';

/**
 * Panel + scroll-thumb geometry. Change here and in one place only — drives
 * `HITLQuestionsBlock` max height / bottom spacer and `HITLQuestionsScrollThumb` math.
 */
export const HITL_QUESTIONS_LAYOUT = {
  PANEL_MAX_HEIGHT_PX: 400,
  /** Scroll list bottom spacer and thumb `bottom` (clearance above footer). */
  BOTTOM_INSET_PX: 52,
  /** Thumb track top offset (equivalent to `top-3`). */
  THUMB_TRACK_TOP_PX: 12,
  SCROLL_THUMB_HEIGHT_PX: 46,
  SCROLL_THUMB_WIDTH_PX: 5,
} as const;
