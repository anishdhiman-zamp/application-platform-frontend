/** Sentinel option ids for approval answers (not sent to API). */
export const HITL_APPROVAL_YES = '__hitl_approval_yes__';
export const HITL_APPROVAL_NO = '__hitl_approval_no__';

/** Sentinel option id used when the user selects the custom free-text input row. */
export const CUSTOM_OPTION_ID = 'custom';

/** Panel max height and scroll list bottom spacer (clearance above footer). */
export const HITL_QUESTIONS_LAYOUT = {
  PANEL_MAX_HEIGHT_PX: 400,
  BOTTOM_INSET_PX: 52,
} as const;
