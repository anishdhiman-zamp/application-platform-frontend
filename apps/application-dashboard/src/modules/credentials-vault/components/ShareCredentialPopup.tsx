import { useMemo } from 'react';
import { Button, TooltipV2 } from '@zamp-platform/ui';
import { Share2 } from 'lucide-react';
import { useGetAgentsListQuery } from '@/apis/agents';
import { credentialConfig, ResourceType, ShareResourcePopup, ShareResourceVersion } from '@/modules/shareResource';
import type { CombinedOptionListDataType } from '@/modules/shareResource/shareResource.types';
import { ResourceAudienceType } from '@/types/api/auth.types';
import { PERMISSION_ROLES } from '@/utils/accessPermission/accessPermission.types';

interface ShareCredentialPopupPropsType {
  credentialId: string;
}

const ShareCredentialPopup = ({ credentialId }: ShareCredentialPopupPropsType) => {
  const { data: agentsData } = useGetAgentsListQuery({});

  const agentOptions: CombinedOptionListDataType[] = useMemo(
    () =>
      (agentsData?.agents ?? []).map((agent) => ({
        label: agent?.name,
        value: agent?.id,
        type: ResourceAudienceType.AGENT,
      })),
    [agentsData],
  );

  return (
    <TooltipV2 tooltipBody='Share' asChildTrigger>
      <span className='inline-flex'>
        <ShareResourcePopup
          resourceId={credentialId}
          resourceType={ResourceType.CREDENTIAL}
          resourceConfig={credentialConfig}
          resourceAdminPrivilege={PERMISSION_ROLES.ADMIN}
          version={ShareResourceVersion.V2}
          additionalOptions={agentOptions}
          renderInDialog
          customTrigger={
            <Button
              variant='ghost'
              size='icon'
              aria-label='Share credential'
              className='text-GRAY_700 hover:text-GRAY_1000 h-7 w-7 p-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0'
            >
              <Share2 className='h-3.5 w-3.5' />
            </Button>
          }
        />
      </span>
    </TooltipV2>
  );
};

export default ShareCredentialPopup;
