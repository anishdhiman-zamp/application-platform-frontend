import { type FC } from 'react';
import { Button, TooltipV2 } from '@zamp-platform/ui';
import { Share2 } from 'lucide-react';
import { useGetAgentsListQuery } from '@/apis/agents';
import { agentConfig, ResourceType, ShareResourcePopup, ShareResourceVersion } from '@/modules/shareResource';
import { PERMISSION_ROLES } from '@/utils/accessPermission/accessPermission.types';

interface ShareAgentPopupProps {
  agentId: string;
  iconOnly?: boolean;
}

const ADMIN_PRIVILEGES = new Set(['owner', 'admin']);

const ShareAgentPopup: FC<ShareAgentPopupProps> = ({ agentId, iconOnly = false }) => {
  const { data: agentsListData } = useGetAgentsListQuery({});
  const agentData = agentsListData?.agents?.find((a) => a.id === agentId);
  const isAdmin = ADMIN_PRIVILEGES.has(agentData?.my_privilege ?? '');
  const customTrigger = iconOnly ? (
    <Button
      size='icon'
      variant='ghost'
      id='share-agent-to-audience-btn'
      aria-label='Share agent'
      className='text-GRAY_700 hover:text-GRAY_1000 -ml-3 h-6 w-6 p-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0'
    >
      <Share2 className='h-3.5 w-3.5' />
    </Button>
  ) : undefined;

  const popup = (
    <ShareResourcePopup
      resourceId={agentId}
      resourceType={ResourceType.AGENT}
      resourceConfig={agentConfig}
      resourceAdminPrivilege={PERMISSION_ROLES.ADMIN}
      version={ShareResourceVersion.V2}
      forceAdminAccess={isAdmin}
      customTrigger={customTrigger}
    />
  );

  if (!iconOnly) return popup;

  return (
    <TooltipV2 tooltipBody='Share' asChildTrigger>
      <span className='inline-flex'>{popup}</span>
    </TooltipV2>
  );
};

export default ShareAgentPopup;
