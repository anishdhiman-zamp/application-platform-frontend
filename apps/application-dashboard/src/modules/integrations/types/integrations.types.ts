import type { ReactNode } from 'react';
import { FormField } from '@zamp-platform/form-builder';
import type { IntegrationConnection } from '@/types/api/integrations';

export const enum ACTION_TYPE {
  TOOL_CALL = 'tool_call',
}

export const enum AUTH_TYPE {
  FORM = 'form',
  CUSTOM = 'custom',
  CONNECTED_URL = 'connected_url',
}

export interface IntegrationAuthButtonAction {
  action_type: ACTION_TYPE;
  tool_name: string;
}

export interface IntegrationAuthButton {
  label: string;
  action: IntegrationAuthButtonAction;
}

export interface IntegrationAuth {
  auth_type: AUTH_TYPE;
  fields: Record<string, FormField>;
  button?: IntegrationAuthButton;
}

export interface IntegrationEvent {
  id: string;
  display_name: string;
}

export interface IntegrationType {
  name: string;
  id: string;
  display_name: string;
  logo: string;
  description?: string;
  what_possible: string[];
  guide: string;
  auth?: string;
  events?: IntegrationEvent[];
  connectionMetadata?: IntegrationConnection;
}

export interface IntegrationsDataType {
  version: number;
  integrations: IntegrationType[];
}

export interface ConnectionPillsDetails {
  title: string;
  action: string;
  accounts: { id: string; email: string }[];
}

export const enum CONNECTION_PILLS_TYPE {
  SYNCED = 'synced',
  REAUTH = 'reauth',
  DISCONNECTED = 'disconnected',
}

export const enum PILLS_ACTIONS {
  CONNECT = 'connect',
  RE_AUTH = 're-auth',
  DISCONNECT = 'disconnect',
}

export type ConnectionPillsDetailsMap = Record<CONNECTION_PILLS_TYPE, ConnectionPillsDetails>;

export interface PillConfig {
  type: CONNECTION_PILLS_TYPE;
  icon: ReactNode;
  tooltipWidth: string;
}

export const ACCOUNT_STATUS = {
  CONNECTED: 'connected',
  ARCHIVED: 'archived',
  NEEDS_REAUTH: 'needs_reauth',
  DISCONNECTED: 'disconnected',
} as const;

export type AccountStatus = (typeof ACCOUNT_STATUS)[keyof typeof ACCOUNT_STATUS];

export interface StatusConfig {
  labelClassName: string;
  icon: ReactNode | null;
  actionLabel: string;
  actionIcon: ReactNode | null;
}
