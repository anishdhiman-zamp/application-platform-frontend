import { store } from 'store';
import { ResourceAudienceType, UserRoleIdType } from 'types/api/auth.types';
import { acceptableRolesForAdminPurpose } from 'utils/accessPermission/accessPermission.constants';
import { PERMISSION_ROLES } from 'utils/accessPermission/accessPermission.types';
import {
  DATASET_ACCESS_PRIVILEGES,
  PAGE_ACCESS_PRIVILEGES,
  PAYMENT_ACCESS_PRIVILEGES,
  ResourceType,
} from '@/modules/shareResource';
import { AudiencesByResourceResponse } from '@/types/api/collaboration.types';

export const accessPermissionForPage = (userRole: string) => {
  const hasAccess = acceptableRolesForAdminPurpose.find((role) => role === userRole);

  if (hasAccess) return true;

  return false;
};

export const accessPermissionForDataset = (userRole: string) => {
  const hasAccess = acceptableRolesForAdminPurpose.find((role) => role === userRole);

  if (hasAccess) return true;

  return false;
};

export const accessPermissionForPeople = () => {
  const userRole = store.getState()?.user?.roles?.find((role) => role.id === UserRoleIdType.USER)?.name;
  const hasAccess = userRole && userRole === PERMISSION_ROLES.SYSTEM_ADMIN;

  if (hasAccess) return true;

  return false;
};

export const adminAccessPermissionForResource = (
  resourceAudiences: AudiencesByResourceResponse[],
  resourceType: ResourceType,
  orgId: string,
  userId: string,
  userTeams: string[],
) => {
  let resourceAdminPrivilege = 'admin';

  if (resourceType === ResourceType.DATASET) {
    resourceAdminPrivilege = DATASET_ACCESS_PRIVILEGES.ADMIN;
  } else if (resourceType === ResourceType.PAGE) {
    resourceAdminPrivilege = PAGE_ACCESS_PRIVILEGES.ADMIN;
  } else if (resourceType === ResourceType.PAYMENTS) {
    resourceAdminPrivilege = PAYMENT_ACCESS_PRIVILEGES.ADMIN;
  }

  for (const audience of resourceAudiences) {
    if (audience.privilege === resourceAdminPrivilege) {
      switch (audience.resource_audience_type) {
        case ResourceAudienceType.ORGANIZATION: {
          if (audience.resource_audience_id === orgId) {
            return true;
          }
          break;
        }
        case ResourceAudienceType.TEAM: {
          if (userTeams.includes(audience.resource_audience_id)) {
            return true;
          }
          break;
        }
        case ResourceAudienceType.USER: {
          if (audience.resource_audience_id === userId) {
            return true;
          }
          break;
        }
      }
    }
  }

  return false;
};
