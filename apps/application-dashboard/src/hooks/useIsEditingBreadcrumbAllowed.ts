import { useMemo } from 'react';
import { useResourceAccess } from 'hooks/useResourceAccess';
import { useParams, usePathname } from 'next/navigation';
import {
  DATASET_ACCESS_PRIVILEGES,
  PAGE_ACCESS_PRIVILEGES,
  ResourceType,
} from '@/modules/shareResource/shareResource.types';
import { MODULE_TYPE } from '@/types/commonTypes';

const useIsEditingBreadcrumbAllowed = () => {
  const params = useParams();
  const pathname = usePathname();
  const skipFlags = useMemo(
    () => ({
      skipAudienceData: false,
      skipTeamsData: false,
    }),
    [],
  );

  const { checkUserPrivilege: checkUserPrivilegeDataset } = useResourceAccess({
    resourceType: ResourceType.DATASET,
    resourceId: params?.datasetId as string,
    ...skipFlags,
  });

  const { checkUserPrivilege: checkUserPrivilegePage } = useResourceAccess({
    resourceType: ResourceType.PAGE,
    resourceId: params?.pageId as string,
    ...skipFlags,
  });

  const isCurrentUserDatasetAdmin = useMemo(() => {
    return checkUserPrivilegeDataset(DATASET_ACCESS_PRIVILEGES.ADMIN);
  }, [checkUserPrivilegeDataset]);

  const isCurrentUserPageAdmin = useMemo(() => {
    return checkUserPrivilegePage(PAGE_ACCESS_PRIVILEGES.ADMIN);
  }, [checkUserPrivilegePage]);

  switch (pathname?.split('/')[1]) {
    case MODULE_TYPE.PAGES:
      return isCurrentUserPageAdmin;
    case MODULE_TYPE.DATASETS:
      return isCurrentUserDatasetAdmin;
    default:
      return false;
  }
};

export default useIsEditingBreadcrumbAllowed;
