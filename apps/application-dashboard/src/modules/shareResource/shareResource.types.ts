/**
 * Generic types for different resources (dataset or page)
 */
export enum ResourceType {
  DATASET = 'dataset',
  PAGE = 'page',
  PAYMENTS = 'payments',
  ACTIVITY = 'activity',
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
export type ShareResourcePopupProps = {
  resourceId?: string;
  resourceType: ResourceType;
  resourceAdminPrivilege: string;
  resourceConfig: ShareResourceConfig;
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
