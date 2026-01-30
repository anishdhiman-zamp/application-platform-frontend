import { FC, ReactNode } from 'react';
import { useResourceAccess } from '@/hooks/useResourceAccess';
import { ResourceType } from '@/modules/shareResource/shareResource.types';

interface PermissionGuardProps {
  resourceType: ResourceType;
  resourceId: string;
  children: ReactNode;
  privilege: string | string[];
}

const PermissionGuard: FC<PermissionGuardProps> = ({ resourceType, resourceId, children, privilege }) => {
  const { checkUserPrivilege } = useResourceAccess({
    resourceType,
    resourceId,
    skipAudienceData: false,
    skipTeamsData: false,
  });

  const privileges = Array.isArray(privilege) ? privilege : [privilege];
  const hasPermission = privileges.some((p) => checkUserPrivilege(p));

  return hasPermission ? children : null;
};

export default PermissionGuard;
