import type { FormField } from '@zamp-platform/form-builder';
import { AUTH_TYPE } from '@/modules/integrations/types/integrations.types';

export type AuthenticateIntegrationRequestType = {
  integration_name: string;
  auth_type: string;
  credentials: Record<string, string>;
};

export type AuthenticateIntegrationResponseType = {
  id: string;
};

export type CreateProcessConnectionMappingRequestType = {
  process_id: string;
  connection_id: string;
};

export type ProcessConnectionMappingType = {
  id: string;
  process_id: string;
  connection_id: string;
  deleted_at?: string;
  created_at: string;
  updated_at: string;
};

export type CreateProcessConnectionMappingResponseType = {
  mapping: ProcessConnectionMappingType;
};

export type ConnectionType = {
  id: string;
  connector_id: string;
  organization_id: string;
  name: string;
  status: string;
  created_at: string;
  updated_at: string;
  integration_name: string;
};

export type GetConnectionsByIntegrationNameResponseType = {
  connections: ConnectionType[];
  limit: number;
  page: number;
  total_count: number;
};

export type ProcessConnectionMappingResponseType = {
  id: string;
  process_id: string;
  connection: ConnectionType;
  deleted_at?: string;
  created_at: string;
  updated_at: string;
};
export type GetProcessConnectionMappingsResponseType = {
  mappings: ProcessConnectionMappingResponseType[];
};

export type IntegrationCatalogRequestType = {
  search?: string;
  provider?: string;
  page?: number;
  page_size?: number;
};

// Represents one authentication method for an integration
export interface IntegrationAuth {
  auth_type: AUTH_TYPE;
  title: string | null;
  description?: string | null;
  fields: Record<string, FormField>;
  default_scopes?: string[];
}

// Represents a single connection (currently empty but extendable)
export interface IntegrationConnection {
  id?: string;
  name?: string;
  status?: string;
  [key: string]: any;
}

// Represents a single integration item
export interface IntegrationItem {
  name: string;
  title: string;
  description: string;
  icon: string;
  provider: string;
  auth: IntegrationAuth[];
  connections: IntegrationConnection[];
}

// Represents the full paginated API response
export interface IntegrationCatalogResponseType {
  items: IntegrationItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export type AuthenticateIntegrationRequestTypeV2 = {
  integration_name: string;
  auth_type: string;
  name: string;
  scopes?: string[];
};

export type AuthenticateIntegrationResponseTypeV2 = {
  id: string;
  connector_id: string | null;
  organization_id: string;
  name: string;
  integration_name: string;
  status: string;
  metadata: Record<string, string>;
  created_by: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};
