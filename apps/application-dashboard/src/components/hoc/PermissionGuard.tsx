import { FC, ReactNode } from 'react';
import { useResourceAccess } from '@/hooks/useResourceAccess';
import { ResourceType } from '@/modules/shareResource/shareResource.types';

interface PermissionGuardProps {
  resourceType: ResourceType;
  resourceId: string;
  children: ReactNode;
  privilege: string;
}

const PermissionGuard: FC<PermissionGuardProps> = ({ resourceType, resourceId, children, privilege }) => {
  const { checkUserPrivilege } = useResourceAccess({
    resourceType,
    resourceId,
    skipAudienceData: false,
  });

  const hasPermission = checkUserPrivilege(privilege);

  return hasPermission ? children : null;
};

export default PermissionGuard;
