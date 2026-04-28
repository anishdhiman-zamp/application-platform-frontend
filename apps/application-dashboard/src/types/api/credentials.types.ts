export interface CredentialResponseType {
  id: string;
  name: string;
  type: string;
  description: string | null;
  credential_purpose: string;
  key_names: string[];
  created_by: string | null;
  created_at: string;
  updated_at: string;
  body: Record<string, string> | null;
}

export interface PaginatedCredentialResponseType {
  credentials: CredentialResponseType[];
  total_count: number;
  page: number;
  limit: number;
}

export interface ListCredentialsRequestType {
  credential_purpose?: string;
  decrypt?: boolean;
  page?: number;
  limit?: number;
}

export interface GetCredentialRequestType {
  credential_id: string;
  decrypt?: boolean;
}

export interface CreateCredentialRequestType {
  name: string;
  body: Record<string, string>;
  type?: string;
  credential_purpose: string;
  description?: string;
}

export interface UpdateCredentialRequestType {
  credential_id: string;
  name?: string;
  body?: Record<string, string>;
  description?: string;
}
