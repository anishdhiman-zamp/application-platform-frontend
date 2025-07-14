import { SENDER_HEADING_VALUES } from 'modules/process/artifacts/components/email-artifact/EmailEditorArtifact/types';

export const FONT_SIZES = [
  {
    label: 'Small',
    value: '10px',
  },
  {
    label: 'Normal',
    value: '16px',
  },
  {
    label: 'Large',
    value: '24px',
  },
  {
    label: 'Huge',
    value: '32px',
  },
];

export const SENDER_HEADINGS = [
  {
    label: 'To',
    value: SENDER_HEADING_VALUES.TO,
  },
  {
    label: 'Cc',
    value: SENDER_HEADING_VALUES.CC,
  },
  {
    label: 'Bcc',
    value: SENDER_HEADING_VALUES.BCC,
  },
] as const;
