import { FC } from 'react';

/**
 * Generic types for different resources (dataset or page)
 */
export enum ResourceType {
  DATASET = 'dataset',
  PAGE = 'page'
}

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
  teamInfo?: {
    name?: string;
    color?: string;
  };
};

/**
 * Generic shape of the API hooks used by the component
 */
export type ResourceApiHooks<T = any> = {
  useGetAudiencesQuery: (params: { [key: string]: string }, options?: any) => {
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
export type ResourceConfig = {
  type: ResourceType;
  idPropName: string; // e.g., "datasetId" or "pageId"
  accessComponent: FC<any>;
  accessPrivilegesList: { label: string; value: string }[];
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
  resourceId: string;
  resourceType: ResourceType;
  apiHooks: ResourceApiHooks;
  resourceConfig: ResourceConfig;
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
