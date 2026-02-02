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
