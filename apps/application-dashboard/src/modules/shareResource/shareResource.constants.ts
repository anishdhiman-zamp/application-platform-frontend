import {
  DATASET_ACCESS_PRIVILEGES,
  PAGE_ACCESS_PRIVILEGES,
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
];

export const RESOURCE_PRIVILEGES: Record<ResourceType, ResourcePrivilege[]> = {
  [ResourceType.DATASET]: CHANGE_ACCESS_PRIVILEGES_LIST.filter((privilege) => privilege.kind === ResourceType.DATASET),
  [ResourceType.PAGE]: CHANGE_ACCESS_PRIVILEGES_LIST.filter((privilege) => privilege.kind === ResourceType.PAGE),
};

/**
 * Configuration for dataset resources
 */
export const datasetConfig: ShareResourceConfig = {
  type: ResourceType.DATASET,
  idPropName: 'datasetId',
  accessPrivilegesList: RESOURCE_PRIVILEGES[ResourceType.DATASET],
  displayName: 'dataset',
  toastMessages: {
    success: TOAST_MESSAGES.SUCCESS_DATASET_SHARED,
    failed: TOAST_MESSAGES.FAILED_DATASET_SHARED,
  },
};

export const pageConfig: ShareResourceConfig = {
  type: ResourceType.PAGE,
  idPropName: 'pageId',
  accessPrivilegesList: RESOURCE_PRIVILEGES[ResourceType.PAGE],
  displayName: 'page',
  toastMessages: {
    success: TOAST_MESSAGES.SUCCESS_PAGE_SHARED,
    failed: TOAST_MESSAGES.FAILED_PAGE_SHARED,
  },
};

export const resourceTypeRouteMap = {
  [ResourceType.DATASET]: 'datasets',
  [ResourceType.PAGE]: 'pages',
};
