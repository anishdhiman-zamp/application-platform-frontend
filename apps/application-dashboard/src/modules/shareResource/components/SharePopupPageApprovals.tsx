import { useMemo, useState } from 'react';
import ShareResourceApprovalCard from 'modules/shareResource/components/ShareResourceApprovalCard2';
import { useGetTeamPendingApprovalsByResourceIdQuery } from '@/apis/people';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import WhoHasAccessSkeletonLoader from '@/components/skeletons/WhoHasAccessSkeletonLoader';
import useAudienceMembers from '@/hooks/useAudienceMembers';
import CustomiseAccess from '@/modules/shareResource/CustomiseAccess';
import { ResourceType } from '@/modules/shareResource/shareResource.types';
import type { FilterModelType } from '@/types/components/table.type';

type SharePopupPageApprovalsProps = {
  resourceType: ResourceType;
  resourceId: string;
  emptyFiltersTitle?: string;
};

const SharePopupPageApprovals = ({ resourceType, resourceId, emptyFiltersTitle }: SharePopupPageApprovalsProps) => {
  const { audiencesData, allTeamsData } = useAudienceMembers({
    resourceType: ResourceType.ORGANIZATION,
    resourceId: '',
  });
  const [fgacFilters, setFgacFilters] = useState<FilterModelType>({});

  const { loading, data } = useAudienceMembers({
    resourceType: resourceType,
    resourceId: resourceId,
  });

  const { data: pendingApprovals, isLoading } = useGetTeamPendingApprovalsByResourceIdQuery({
    resourceType,
    resourceId: resourceId ?? '',
  });

  const { pendingApprovalList, sentForApprovalList } = useMemo(() => {
    const pendingApprovalList = pendingApprovals?.filter((member) => member?.can_approve);
    const sentForApprovalList = pendingApprovals?.filter((member) => !member?.can_approve);

    return { pendingApprovalList, sentForApprovalList };
  }, [pendingApprovals]);

  if (pendingApprovals?.length === 0 || isLoading) return null;

  return (
    <div className='mt-2 rounded-3.5 py-2 p-1 border-0.5 border-GRAY_500 bg-white shadow-tableFilterMenu'>
      <div className='flex flex-col w-full mt-2 max-h-[222px] overflow-y-auto [&::-webkit-scrollbar]:hidden'>
        <CommonWrapper skeletonType={SkeletonTypes.CUSTOM} isLoading={loading} loader={<WhoHasAccessSkeletonLoader />}>
          {!!pendingApprovalList?.length && (
            <div>
              <span className='f-12-500 text-GRAY_700 p-2'>Your approval needed</span>
              {pendingApprovalList?.map((audience) => (
                <ShareResourceApprovalCard
                  key={audience?.audience_id}
                  allTeams={allTeamsData ?? []}
                  allAudience={audiencesData ?? []}
                  audiencesData={data ?? []}
                  audience={audience}
                  onViewDetails={() => setFgacFilters(audience?.fgac_filters ?? {})}
                  emptyFiltersTitle={emptyFiltersTitle ?? ''}
                />
              ))}
            </div>
          )}
          {!!sentForApprovalList?.length && (
            <div>
              <span className='f-12-500 text-GRAY_700 p-2'>Sent for approval</span>
              {sentForApprovalList?.map((audience) => (
                <ShareResourceApprovalCard
                  key={audience?.audience_id}
                  allTeams={allTeamsData ?? []}
                  allAudience={audiencesData ?? []}
                  audiencesData={data ?? []}
                  audience={audience}
                  onViewDetails={() => setFgacFilters(audience?.fgac_filters ?? {})}
                  emptyFiltersTitle={emptyFiltersTitle ?? ''}
                />
              ))}
            </div>
          )}
        </CommonWrapper>
        {!!Object.keys(fgacFilters)?.length && (
          <CustomiseAccess
            isOpen={!!fgacFilters}
            onClose={() => setFgacFilters({})}
            datasetId={resourceId}
            resourceType={resourceType}
            fgacFilters={fgacFilters}
          />
        )}
      </div>
    </div>
  );
};

export default SharePopupPageApprovals;
