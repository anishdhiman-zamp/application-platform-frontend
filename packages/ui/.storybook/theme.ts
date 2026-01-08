import { create } from 'storybook/theming/create';

export default create({
  base: 'light',
  brandTitle: 'Zamp UI',
  brandUrl: 'https://zamp.finance',
  brandTarget: '_self',

  // UI
  appBg: '#ffffff',
  appContentBg: '#ffffff',
  appBorderColor: '#e5e7eb',
  appBorderRadius: 4,

  // Typography
  fontBase: '"Inter", sans-serif',
  fontCode: 'monospace',

  // Text colors
  textColor: '#111827',
  textInverseColor: '#ffffff',

  // Toolbar default and active colors
  barTextColor: '#6b7280',
  barSelectedColor: '#111827',
  barBg: '#f9fafb',

  // Form colors
  inputBg: '#ffffff',
  inputBorder: '#e5e7eb',
  inputTextColor: '#111827',
  inputBorderRadius: 4,

  // Button colors
  buttonBg: '#f3f4f6',
  buttonBorder: '#e5e7eb',
  booleanBg: '#f3f4f6',
  booleanSelectedBg: '#111827',
});
