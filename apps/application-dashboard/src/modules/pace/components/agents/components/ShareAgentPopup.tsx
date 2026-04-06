import { type FC } from 'react';
import { useGetAgentsListQuery } from '@/apis/agents';
import { agentConfig, ResourceType, ShareResourcePopup, ShareResourceVersion } from '@/modules/shareResource';
import { PERMISSION_ROLES } from '@/utils/accessPermission/accessPermission.types';

interface ShareAgentPopupProps {
  agentId: string;
}

const ADMIN_PRIVILEGES = new Set(['owner', 'admin']);

const ShareAgentPopup: FC<ShareAgentPopupProps> = ({ agentId }) => {
  const { data: agentsListData } = useGetAgentsListQuery({});
  const agentData = agentsListData?.agents?.find((a) => a.id === agentId);
  const isAdmin = ADMIN_PRIVILEGES.has(agentData?.my_privilege ?? '');

  return (
    <ShareResourcePopup
      resourceId={agentId}
      resourceType={ResourceType.AGENT}
      resourceConfig={agentConfig}
      resourceAdminPrivilege={PERMISSION_ROLES.ADMIN}
      version={ShareResourceVersion.V2}
      forceAdminAccess={isAdmin}
    />
  );
};

export default ShareAgentPopup;
