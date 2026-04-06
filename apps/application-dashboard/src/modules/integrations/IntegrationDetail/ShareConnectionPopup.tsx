import { type FC, useMemo } from 'react';
import { useGetAgentsListQuery } from '@/apis/agents';
import { connectionConfig, ResourceType, ShareResourcePopup, ShareResourceVersion } from '@/modules/shareResource';
import type { CombinedOptionListDataType } from '@/modules/shareResource/shareResource.types';
import { ResourceAudienceType } from '@/types/api/auth.types';
import { PERMISSION_ROLES } from '@/utils/accessPermission/accessPermission.types';

type ShareConnectionPopupProps = {
  connectionId: string;
};

const ShareConnectionPopup: FC<ShareConnectionPopupProps> = ({ connectionId }) => {
  const { data: agentsData } = useGetAgentsListQuery({});

  const agentOptions: CombinedOptionListDataType[] = useMemo(
    () =>
      (agentsData?.agents ?? []).map((agent) => ({
        label: agent.name,
        value: agent.id,
        type: ResourceAudienceType.AGENT,
      })),
    [agentsData],
  );

  return (
    <ShareResourcePopup
      resourceId={connectionId}
      resourceType={ResourceType.CONNECTION}
      resourceConfig={connectionConfig}
      resourceAdminPrivilege={PERMISSION_ROLES.ADMIN}
      version={ShareResourceVersion.V2}
      additionalOptions={agentOptions}
    />
  );
};

export default ShareConnectionPopup;
