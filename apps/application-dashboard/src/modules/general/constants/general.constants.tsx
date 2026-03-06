export const PREFERENCES_ROWS = [
  { key: 'theme', label: 'Theme' },
  { key: 'time_zone', label: 'Time Zone', value: '(GMT+05:30) Calcutta' },
];

export const PROFILE_ROWS: { key: string; label: string; value?: string }[] = [
  { key: 'email', label: 'Email' },
  { key: 'user_id', label: 'User ID' },
  {
    key: 'delete_account',
    label: 'Delete account',
    value:
      "Permanently delete your account. You'll no longer be able to access your pages or any of the workspaces you belong to.",
  },
];

export const THEME_CSS_CLASSES = {
  HTML_DARK: 'dark',
  BODY_DARK: 'dark-mode',
  BODY_LIGHT: 'light-mode',
} as const;

export const enum THEME_MODE {
  LIGHT = 'light',
  DARK = 'dark',
  SYSTEM = 'system',
}

export const THEME_OPTIONS: { value: THEME_MODE; label: string }[] = [
  { value: THEME_MODE.LIGHT, label: 'Light' },
  { value: THEME_MODE.DARK, label: 'Dark' },
  { value: THEME_MODE.SYSTEM, label: 'System' },
];
