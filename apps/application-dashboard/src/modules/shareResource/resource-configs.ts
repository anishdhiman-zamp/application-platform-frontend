import DatasetAccessToAudiences from 'modules/data/components/DatasetAccessToAudiences';
import { DATASET_ACCESS_PRIVILEGES_LIST } from 'modules/data/data.constants';
import PageAccessToAudiences from 'modules/page/PageAccessToAudience';
import { PAGE_ACCESS_PRIVILEGES_LIST } from 'modules/page/pages.constants';
import { ResourceConfig, ResourceType } from 'modules/shareResource/share-resource.types';
import { TOAST_MESSAGES } from 'components/common/toast/toast.constants';

/**
 * Configuration for dataset resources
 */
export const datasetConfig: ResourceConfig = {
  type: ResourceType.DATASET,
  idPropName: 'datasetId',
  accessComponent: DatasetAccessToAudiences,
  accessPrivilegesList: DATASET_ACCESS_PRIVILEGES_LIST,
  displayName: 'dataset',
  toastMessages: {
    success: TOAST_MESSAGES.SUCCESS_DATASET_SHARED,
    failed: TOAST_MESSAGES.FAILED_DATASET_SHARED,
  },
};

/**
 * Configuration for page resources
 */
export const pageConfig: ResourceConfig = {
  type: ResourceType.PAGE,
  idPropName: 'pageId',
  accessComponent: PageAccessToAudiences,
  accessPrivilegesList: PAGE_ACCESS_PRIVILEGES_LIST,
  displayName: 'page',
  toastMessages: {
    success: TOAST_MESSAGES.SUCCESS_PAGE_SHARED,
    failed: TOAST_MESSAGES.FAILED_PAGE_SHARED,
  },
};
