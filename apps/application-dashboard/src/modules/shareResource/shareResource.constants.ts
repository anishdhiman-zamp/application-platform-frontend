import {
  DATASET_ACCESS_PRIVILEGES,
  PAGE_ACCESS_PRIVILEGES,
  PAYMENT_ACCESS_PRIVILEGES,
  PROCESS_ACCESS_PRIVILEGES,
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
  {
    kind: ResourceType.PROCESS,
    label: 'Admin',
    value: PROCESS_ACCESS_PRIVILEGES.ADMIN,
    desc: 'Can manage and share process',
  },
  {
    kind: ResourceType.PROCESS,
    label: 'Viewer',
    value: PROCESS_ACCESS_PRIVILEGES.VIEWER,
    desc: 'Can view process only',
  },
  {
    kind: ResourceType.PROCESS,
    label: 'Editor',
    value: PROCESS_ACCESS_PRIVILEGES.EDITOR,
    desc: 'Can edit process',
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
  [ResourceType.PROCESS]: CHANGE_ACCESS_PRIVILEGES_LIST.filter((privilege) => privilege.kind === ResourceType.PROCESS),
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

export const processConfig: ShareResourceConfig = {
  type: ResourceType.PROCESS,
  accessPrivilegesList: RESOURCE_PRIVILEGES[ResourceType.PROCESS],
  displayName: 'process',
  toastMessages: {
    success: TOAST_MESSAGES.SUCCESS_PROCESS_SHARED,
    failed: TOAST_MESSAGES.FAILED_PROCESS_SHARED,
  },
};

export const resourceTypeRouteMap = {
  [ResourceType.DATASET]: 'datasets',
  [ResourceType.PAGE]: 'pages',
  [ResourceType.PAYMENTS]: 'payments',
  [ResourceType.PROCESS]: 'processes',
  [ResourceType.ORGANIZATION]: 'organizations',
};

export const ACCESS_MESSAGES_ADMIN_ROLE = 'Admin will have access to all data';
export const ACCESS_MESSAGES_CUSTOMISE_ACCESS = 'Only admins can customise access';
