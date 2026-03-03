export type LogoutFlow = {
  logout_url: string;
  logout_token: string;
};

export type FlowUiMessage = {
  id: number;
  text: string;
  type: 'info' | 'error';
};

export type FlowNode = {
  type: string;
  group: string;
  attributes: {
    name: string;
    type: string;
    value: string | null;
    disabled?: boolean;
    node_type?: string;
    logo_url?: string;
  };
  messages: FlowUiMessage[];
  meta?: {
    label?: {
      id: number;
      text: string;
      type: string;
      context?: {
        provider: string;
      };
    };
  };
};

export type FlowExpiredResponse = {
  error: { id: string; code: number; status: string; reason: string; message: string };
  expired_at: string;
  since: number;
  use_flow_id: string;
};

export type LoginFlow = {
  id: string;
  organization_id: null;
  type: string;
  expires_at: string;
  issued_at: string;
  request_url: string;
  ui: {
    action: string;
    method: string;
    nodes: FlowNode[];
    messages?: FlowUiMessage[] | null;
  };
  created_at: string;
  updated_at: string;
  refresh: boolean;
  requested_aal: string;
  state: string;
  continue_with?: { action: string; redirect_browser_to?: string }[];
};

// TODO: check if type is correct
export type ErrorDetails = {
  message: string;
  id: string;
  error: {
    code: string;
    status: number;
    reason: string;
    message: string;
  };
  created_at: string;
  updated_at: string;
};

export type Workspace = {
  workspace_id: string;
  name: string;
  description: string;
};

export type Organization = {
  organization_id: string;
  name: string;
  slug: string;
  resource_audience_policies: {
    privilege: string;
    resource_audience_type: string;
    resource_audience_id: string;
  }[];
};

export enum ResourceAudienceType {
  ORGANIZATION = 'organization',
  USER = 'user',
  TEAM = 'team',
}

export type Session = {
  user_id: string;
  workspaces: Workspace[];
  organization_id: Workspace;
  user_email: string;
  user_name: string;
  display_name: string;
  last_name: string;
  username: string;
  orgs: Organization[];
  onboarding_status: string | null;
  avatar_type: 'seed' | 'url' | null;
  avatar_value: string | null;
};

export type loginPayloadType = {
  url: string;
  body: string;
};

export enum UserRoleIdType {
  USER = 'user',
}

export type UserSessionCache = {
  user_id: string;
  user_email: string;
  org_count: number;
  default_org_id: string;
  cached_at: number;
};
