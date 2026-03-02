export enum LOGIN_GROUPS {
  OIDC = 'oidc',
  CODE = 'code',
  PASSWORD = 'password',
}

export const SESSION_ALREADY_AVAILABLE_ERROR = 'session_already_available';
export const VALID_SESSION_DETECTED_ERROR_MSG = 'A valid session was detected';

export const RESEND_SUCCESS_MESSAGE_IDS = [1040005, 1010014];

export const INVALID_CODE_MESSAGE_IDS = [4000008, 4010008, 4040003];

export const PROFESSIONS = [
  'Engineer',
  'Accountant',
  'CFO',
  'CEO',
  'Designer',
  'Architect',
  'Analyst',
  'Strategist',
  'Developer',
  'Marketer',
  'Scientist',
  'Editor',
  'Copywriter',
  'Lawyer',
  'Economist',
  'Researcher',
  'Technician',
  'Consultant',
  'Manager',
  'Recruiter',
  'Data Scientist',
  'UI/UX Expert',
  'Project Lead',
  'Systems Admin',
  'Cloud Architect',
  'Content Creator',
  'Videographer',
  'Social Media Head',
  'Product Manager',
  'Support Specialist',
  'HR Director',
  'Growth Hacker',
  'Cybersecurity',
  'Sales Rep',
  'PR Manager',
  'Operations Lead',
  'Investor',
  'Blockchain Eng',
  'ML Researcher',
  'QA Engineer',
  'Solutions Architect',
  'Data Engineer',
  'Frontend Dev',
  'Backend Dev',
  'Fullstack Dev',
  'DevOps',
  'Legal Counsel',
  'Auditor',
  'Tax Consultant',
  'Supply Chain Manager',
  'Logistics Expert',
  'E-commerce Head',
  'Brand Designer',
  'Art Director',
  'Motion Designer',
  '3D Artist',
  'Game Developer',
  'Community Manager',
  'Customer Success',
  'Business Analyst',
  'Market Researcher',
  'Finance Lead',
  'Treasury Head',
  'Compliance Officer',
  'Risk Manager',
  'Portfolio Manager',
];

export const COLOR_PALETTE = ['#6b6b5d', '#2563EB', '#843d63', '#6d7a42', '#4a5d29', '#9b7fa3'];

export const REVEAL_RADIUS = 350;
export const CARD_PAD_X = 60;
export const CARD_PAD_Y = 40;
export const CARD_FADE_ZONE = 120;

export const OTP_LENGTH = 6;
export const RESEND_COOLDOWN_SECONDS = 30;

export const enum OTP_STATUS {
  IDLE = 'idle',
  SUBMITTING = 'submitting',
  RESENDING = 'resending',
  SUCCESS = 'success',
}

export const enum RESEND_RESULT {
  SENT = 'sent',
  FLOW_EXPIRED = 'flow_expired',
  FAILED = 'failed',
}

export const enum EXPIRY_TYPE {
  CODE_EXPIRED = 'code_expired',
  FLOW_EXPIRED = 'flow_expired',
  UNKNOWN = 'unknown',
}

export const enum LOADING_ACTION {
  IDLE = 'idle',
  EMAIL = 'email',
  GOOGLE = 'google',
  SSO = 'sso',
}

export const enum ACTIVE_VIEW {
  OTP = 'otp',
  PASSWORD = 'password',
  METHOD_PICKER = 'methodPicker',
  EMAIL_ENTRY = 'emailEntry',
}

export const enum LOGIN_FORM_MESSAGES {
  INVALID_EMAIL = 'Please enter a valid email address',
  GOOGLE_UNAVAILABLE = 'Google login is not available for this configuration',
  SEND_CODE_FAILED = 'Failed to send code. Please try again.',
}

export const enum OTP_MESSAGES {
  CODE_EXPIRED_RESENT = 'Code expired. New code sent to your email.',
  CODE_EXPIRED_RESEND_PROMPT = 'Code expired. Please click Resend to get a new code.',
  SESSION_EXPIRED_RESENT = 'Session expired. New code sent to your email.',
  SESSION_EXPIRED_RETRY = 'Session expired. Please try again.',
  INCORRECT_CODE = 'Incorrect code. Please try again.',
  GENERIC_ERROR = 'Something went wrong. Please try again.',
  NETWORK_ERROR = 'Network error. Please try again.',
  NEW_CODE_SENT = 'New code sent to your email.',
  RESEND_FAILED = 'Failed to resend code. Please try again.',
}
