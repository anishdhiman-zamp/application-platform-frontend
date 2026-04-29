/**
 * Generic types for different resources (dataset or page)
 */
export enum ResourceType {
  DATASET = 'dataset',
  PAGE = 'page',
  PAYMENTS = 'payments',
  PROCESS = 'process',
  ORGANIZATION = 'organization',
  CONNECTION = 'connection',
  APP = 'app',
  AGENT = 'agent',
  CONVERSATION = 'conversation',
  CREDENTIAL = 'credential',
}

export type TeamInfoType = {
  name?: string;
  color?: string;
};

/**
 * Props for the resource access component
 */
export type ResourceAccessComponentProps = {
  resourceId: string;
  resource_type: string;
  privilege: string;
  resource_audience_id: string;
  resource_audience_type: string;
  user: {
    email: string;
    name?: string;
  };
  userPrivilege: string;
  orgName?: string;
  customerName?: string;
  teamInfo?: TeamInfoType;
};

/**
 * Generic shape of the API hooks used by the component
 */
export type ResourceApiHooks<T = any> = {
  useGetAudiencesQuery: (
    params: { [key: string]: string },
    options?: any,
  ) => {
    data: T[];
    isLoading: boolean;
    refetch: () => void;
  };
  usePostShareMutation: () => [(params: { [key: string]: any }, options?: any) => Promise<any>, { isLoading: boolean }];
  accessPermissionFn: (privilege: string) => boolean;
};

/**
 * Configuration for resource-specific behavior
 */
export type ShareResourceConfig = {
  type: ResourceType;
  accessPrivilegesList: ResourcePrivilege[];
  displayName: string; // For UI display
  toastMessages: {
    success: string;
    failed: string;
  };
};

/**
 * Props for the shared component
 */

export const enum ShareResourceVersion {
  V1 = 'v1',
  V2 = 'v2',
}
export type ShareResourcePopupProps = {
  resourceId?: string;
  resourceType: ResourceType;
  resourceAdminPrivilege: string;
  resourceConfig: ShareResourceConfig;
  isCustomiseAccess?: boolean;
  title?: string;
  disable?: boolean;
  version?: ShareResourceVersion;
  additionalOptions?: CombinedOptionListDataType[];
  forceAdminAccess?: boolean;
  customTrigger?: React.ReactNode;
  renderInDialog?: boolean;
};

/**
 * Type for validation result
 */
export type ValidationResult = {
  isValid: boolean;
  message?: string;
  resource_audience_type?: string;
  resource_audience_id?: string;
};

export type ResourcePrivilege = {
  kind: ResourceType;
  label: string;
  value: string;
  desc: string;
};

export type CombinedOptionListDataType = {
  label: string;
  value: string;
  type?: string;
  color?: string;
  team_id?: string;
};

export enum PAGE_ACCESS_PRIVILEGES {
  ADMIN = 'admin',
  VIEWER = 'viewer',
}

export type PageAccessPrivilegesType = {
  label: string;
  value: PAGE_ACCESS_PRIVILEGES;
};

export enum DATASET_ACCESS_PRIVILEGES {
  ADMIN = 'admin',
  VIEWER = 'viewer',
  DATA_EDITOR = 'editor',
}

export type DatasetAccessPrivilegesType = {
  label: string;
  value: DATASET_ACCESS_PRIVILEGES;
};

export enum PAYMENT_ACCESS_PRIVILEGES {
  ADMIN = 'admin',
  INITIATOR = 'initiator',
  VIEWER = 'viewer',
}

export type PaymentAccessPrivilegesType = {
  label: string;
  value: PAYMENT_ACCESS_PRIVILEGES;
};

export enum PROCESS_ACCESS_PRIVILEGES {
  ADMIN = 'admin',
  VIEWER = 'viewer',
  EDITOR = 'editor',
}

export enum CONNECTION_ACCESS_PRIVILEGES {
  ADMIN = 'admin',
  VIEWER = 'viewer',
}

export enum APP_ACCESS_PRIVILEGES {
  ADMIN = 'admin',
  EDITOR = 'editor',
  VIEWER = 'viewer',
}

export enum AGENT_ACCESS_PRIVILEGES {
  OWNER = 'owner',
  ADMIN = 'admin',
  VIEWER = 'viewer',
}

export enum CONVERSATION_ACCESS_PRIVILEGES {
  VIEWER = 'viewer',
}

export enum CREDENTIAL_ACCESS_PRIVILEGES {
  ADMIN = 'admin',
  VIEWER = 'viewer',
}

export type ProcessAccessPrivilegesType = {
  label: string;
  value: PROCESS_ACCESS_PRIVILEGES;
};
