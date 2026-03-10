/** Backend error markers used for matching API error responses */
export const BACKEND_ERRORS = {
  FLAG_OFF_MESSAGE: 'Onboarding flow is currently disabled',
  WRONG_STEP_PREFIX: 'Expected status',
} as const;

/** Fallback messages when backend detail is missing */
export const ERROR_MESSAGES = {
  GENERIC: 'Something went wrong. Please try again.',
  PERMISSION_DENIED: 'You do not have permission for this action.',
  INVALID_REQUEST: 'Invalid request.',
  USERNAME_TAKEN: 'This username is already taken',
  USERNAME_LENGTH: 'Username must be 3\u201350 characters',
  USERNAME_FORMAT: 'Only letters, numbers, underscores, and hyphens',
  NAME_MAX_LENGTH: 'Name must be 400 characters or less',
  ORG_NAME_MAX_LENGTH: 'Organisation name must be 200 characters or less',
  FILE_TOO_LARGE: 'File must be under 5 MB',
} as const;

/** Validation rules matching backend Pydantic constraints */
export const VALIDATION = {
  NAME_MAX: 400,
  USERNAME_MIN: 3,
  USERNAME_MAX: 50,
  USERNAME_REGEX: /^[a-zA-Z0-9_-]+$/,
  ORG_NAME_MAX: 200,
  AVATAR_MAX_SIZE_BYTES: 5 * 1024 * 1024, // 5 MB
} as const;

/** Feedback messages shown during async checks */
export const FEEDBACK_MESSAGES = {
  CHECKING_USERNAME: 'Checking availability\u2026',
  USERNAME_AVAILABLE: 'Username is available',
} as const;
