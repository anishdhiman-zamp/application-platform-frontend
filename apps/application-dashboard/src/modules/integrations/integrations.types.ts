import type { ReactNode } from 'react';

export interface IntegrationType {
  id: string;
  display_name: string;
  logo: string;
  what_possible: string[];
  guide: string;
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
