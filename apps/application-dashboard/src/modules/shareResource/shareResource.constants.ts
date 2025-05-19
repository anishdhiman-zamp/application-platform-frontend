import {
  DATASET_ACCESS_PRIVILEGES,
  PAGE_ACCESS_PRIVILEGES,
  PAYMENT_ACCESS_PRIVILEGES,
  ResourcePrivilege,
  ResourceType,
  ShareResourceConfig,
} from '@/modules/shareResource/shareResource.types';
import { TOAST_MESSAGES } from 'components/common/toast/toast.constants';

export const CHANGE_ACCESS_PRIVILEGES_LIST: ResourcePrivilege[] = [
  {
    kind: ResourceType.DATASET,
    label: 'Admin',
    value: DATASET_ACCESS_PRIVILEGES.ADMIN,
    desc: 'Can manage and share dataset',
  },
  {
    kind: ResourceType.DATASET,
    label: 'Viewer',
    value: DATASET_ACCESS_PRIVILEGES.VIEWER,
    desc: 'Can read data only',
  },
  {
    kind: ResourceType.DATASET,
    label: 'Data editor',
    value: DATASET_ACCESS_PRIVILEGES.DATA_EDITOR,
    desc: 'Can update existing data',
  },
  {
    kind: ResourceType.PAGE,
    label: 'Admin',
    value: PAGE_ACCESS_PRIVILEGES.ADMIN,
    desc: 'Can manage and share page',
  },
  {
    kind: ResourceType.PAGE,
    label: 'Viewer',
    value: PAGE_ACCESS_PRIVILEGES.VIEWER,
    desc: 'Can view page only',
  },
  {
    kind: ResourceType.PAYMENTS,
    label: 'Admin',
    value: PAYMENT_ACCESS_PRIVILEGES.ADMIN,
    desc: 'Can manage and share payments',
  },
  {
    kind: ResourceType.PAYMENTS,
    label: 'Initiator',
    value: PAYMENT_ACCESS_PRIVILEGES.INITIATOR,
    desc: 'Can initiate payments',
  },
  {
    kind: ResourceType.PAYMENTS,
    label: 'Viewer',
    value: PAYMENT_ACCESS_PRIVILEGES.VIEWER,
    desc: 'Can view payments only',
  },
];

export const resourcePrivilegeRank = {
  [ResourceType.DATASET]: {
    [DATASET_ACCESS_PRIVILEGES.ADMIN]: 1,
    [DATASET_ACCESS_PRIVILEGES.VIEWER]: 2,
  },
  [ResourceType.PAGE]: {
    [PAGE_ACCESS_PRIVILEGES.ADMIN]: 1,
    [PAGE_ACCESS_PRIVILEGES.VIEWER]: 2,
  },
  [ResourceType.PAYMENTS]: {
    [PAYMENT_ACCESS_PRIVILEGES.ADMIN]: 1,
    [PAYMENT_ACCESS_PRIVILEGES.INITIATOR]: 2,
    [PAYMENT_ACCESS_PRIVILEGES.VIEWER]: 3,
  },
};

export const RESOURCE_PRIVILEGES: Record<ResourceType, ResourcePrivilege[]> = {
  [ResourceType.DATASET]: CHANGE_ACCESS_PRIVILEGES_LIST.filter((privilege) => privilege.kind === ResourceType.DATASET),
  [ResourceType.PAGE]: CHANGE_ACCESS_PRIVILEGES_LIST.filter((privilege) => privilege.kind === ResourceType.PAGE),
  [ResourceType.PAYMENTS]: CHANGE_ACCESS_PRIVILEGES_LIST.filter(
    (privilege) => privilege.kind === ResourceType.PAYMENTS,
  ),
  [ResourceType.ACTIVITY]: CHANGE_ACCESS_PRIVILEGES_LIST.filter(
    (privilege) => privilege.kind === ResourceType.ACTIVITY,
  ),
  [ResourceType.ORGANIZATION]: CHANGE_ACCESS_PRIVILEGES_LIST.filter(
    (privilege) => privilege.kind === ResourceType.ORGANIZATION,
  ),
};

/**
 * Configuration for dataset resources
 */
export const datasetConfig: ShareResourceConfig = {
  type: ResourceType.DATASET,
  accessPrivilegesList: RESOURCE_PRIVILEGES[ResourceType.DATASET],
  displayName: 'dataset',
  toastMessages: {
    success: TOAST_MESSAGES.SUCCESS_DATASET_SHARED,
    failed: TOAST_MESSAGES.FAILED_DATASET_SHARED,
  },
};

export const pageConfig: ShareResourceConfig = {
  type: ResourceType.PAGE,
  accessPrivilegesList: RESOURCE_PRIVILEGES[ResourceType.PAGE],
  displayName: 'page',
  toastMessages: {
    success: TOAST_MESSAGES.SUCCESS_PAGE_SHARED,
    failed: TOAST_MESSAGES.FAILED_PAGE_SHARED,
  },
};

export const paymentsConfig: ShareResourceConfig = {
  type: ResourceType.PAYMENTS,
  accessPrivilegesList: RESOURCE_PRIVILEGES[ResourceType.PAYMENTS],
  displayName: 'payments',
  toastMessages: {
    success: TOAST_MESSAGES.SUCCESS_PAYMENTS_SHARED,
    failed: TOAST_MESSAGES.FAILED_PAYMENTS_SHARED,
  },
};

export const activityConfig: ShareResourceConfig = {
  type: ResourceType.ACTIVITY,
  accessPrivilegesList: RESOURCE_PRIVILEGES[ResourceType.ACTIVITY],
  displayName: 'activity',
  toastMessages: {
    success: TOAST_MESSAGES.SUCCESS_ACTIVITY_SHARED,
    failed: TOAST_MESSAGES.FAILED_ACTIVITY_SHARED,
  },
};

export const resourceTypeRouteMap = {
  [ResourceType.DATASET]: 'datasets',
  [ResourceType.PAGE]: 'pages',
  [ResourceType.PAYMENTS]: 'payments',
  [ResourceType.ACTIVITY]: 'activities',
  [ResourceType.ORGANIZATION]: 'organizations',
};

export const ACCESS_MESSAGES_ADMIN_ROLE = 'Admin will have access to all data';
export const ACCESS_MESSAGES_CUSTOMISE_ACCESS = 'Only admins can customise access';
