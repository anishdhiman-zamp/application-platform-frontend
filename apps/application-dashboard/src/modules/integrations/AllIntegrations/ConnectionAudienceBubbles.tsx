'use client';

import { useMemo } from 'react';
import { TooltipV2 } from '@zamp-platform/ui';
import { useGetAgentsListQuery } from '@/apis/agents';
import { API_ENDPOINTS } from '@/apis/apiEndpoint.constants';
import { useGetAudiencesByResourceIdQuery } from '@/apis/collaboration';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import AudienceBubblesSkeleton from '@/modules/integrations/AllIntegrations/AudienceBubblesSkeleton';
import {
  CONNECTION_ROLE,
  type ConnectionAudienceBubblesPropsType,
} from '@/modules/integrations/types/integrations.types';
import { ResourceAudienceType } from '@/types/api/auth.types';
import { SIDE_OPTIONS } from '@/types/commonTypes';
import { getNameInitial } from '@/utils/common';

const ConnectionAudienceBubbles = ({ connectionId, maxVisible = 3 }: ConnectionAudienceBubblesPropsType) => {
  const {
    data: audiencesData,
    isLoading: isLoadingAudiences,
    isError: isAudiencesError,
    refetch: refetchAudiences,
  } = useGetAudiencesByResourceIdQuery({
    apiEndpoint: API_ENDPOINTS.RESOURCE_AUDIENCES_BY_RESOURCE_ID_GET_V2,
    resourceRoute: 'connection',
    resourceId: connectionId,
  });
  const { data: agentsData } = useGetAgentsListQuery({ filter: 'all' });

  const agentNameById = useMemo(() => new Map(agentsData?.agents?.map((a) => [a.id, a.name]) ?? []), [agentsData]);

  const bubbles = useMemo(() => {
    const userAudiences = (audiencesData ?? []).filter((a) => a.resource_audience_type === ResourceAudienceType.USER);

    return userAudiences.map((audience) => {
      const agentName = agentNameById.get(audience.resource_audience_id);
      const name = agentName ?? audience.user?.name ?? audience.user?.email ?? '';
      const role = audience.privilege === CONNECTION_ROLE.ADMIN ? 'Admin' : 'Viewer';

      return { id: audience.resource_audience_id, name, role };
    });
  }, [audiencesData, agentNameById]);

  const visible = bubbles.slice(0, maxVisible);
  const overflow = bubbles.length - visible.length;

  const tooltipBody = (
    <div className='flex max-h-25 flex-col gap-y-1 overflow-y-auto [scrollbar-width:thin]'>
      {bubbles.map((b) => (
        <div key={b.id} className='flex items-center justify-between gap-x-4 pr-3'>
          <span className='f-11-500 text-BG_WHITE truncate'>{b.name}</span>
          <span className='f-11-400 text-GRAY_500 shrink-0'>{b.role}</span>
        </div>
      ))}
    </div>
  );

  return (
    <CommonWrapper
      isLoading={isLoadingAudiences}
      isError={isAudiencesError}
      isNoData={!isLoadingAudiences && !isAudiencesError && bubbles.length === 0}
      refetchFunction={refetchAudiences}
      skeletonType={SkeletonTypes.CUSTOM}
      loader={<AudienceBubblesSkeleton />}
      noDataBanner={null}
      renderError={null}
      disableAnimation
    >
      <TooltipV2 tooltipBody={tooltipBody} asChildTrigger side={SIDE_OPTIONS.RIGHT} tooltipClassName='pr-0'>
        <div className='flex items-center'>
          {visible.map((b, idx) => (
            <span
              key={b.id}
              style={{ zIndex: visible.length - idx }}
              className='border-BG_WHITE bg-GRAY_200 text-GRAY_700 f-10-550 relative -ml-1.5 flex h-5 w-5 items-center justify-center rounded-full border first:ml-0'
            >
              {getNameInitial(b.name)}
            </span>
          ))}
          {overflow > 0 && <span className='text-GRAY_700 f-10-550 ml-1'>+{overflow}</span>}
        </div>
      </TooltipV2>
    </CommonWrapper>
  );
};

export default ConnectionAudienceBubbles;
