import ShareResourceApprovalCard from 'modules/shareResource/components/ShareResourceApprovalCard2';
import { useGetTeamPendingApprovalsByResourceIdQuery } from '@/apis/people';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import WhoHasAccessSkeletonLoader from '@/components/skeletons/WhoHasAccessSkeletonLoader';
import useAudienceMembers from '@/hooks/useAudienceMembers';
import { ResourceType } from '@/modules/shareResource/shareResource.types';

type SharePopupPageApprovalsProps = {
  resourceType: ResourceType;
  resourceId: string;
};

const SharePopupPageApprovals = ({ resourceType, resourceId }: SharePopupPageApprovalsProps) => {
  const { audiencesData, allTeamsData } = useAudienceMembers({
    resourceType: ResourceType.ORGANIZATION,
    resourceId: '',
  });

  const { loading, data } = useAudienceMembers({
    resourceType: resourceType,
    resourceId: resourceId,
  });

  const { data: pendingApprovals, isLoading } = useGetTeamPendingApprovalsByResourceIdQuery({
    resourceType,
    resourceId: resourceId ?? '',
  });

  if (pendingApprovals?.length === 0 || isLoading) return null;

  return (
    <div className='mt-2 rounded-3.5 py-2 p-1 border-0.5 border-GRAY_500 bg-white shadow-tableFilterMenu'>
      <span className='f-12-500 text-GRAY_700 p-2'>Approvals pending</span>
      <div className='flex flex-col w-full mt-2 max-h-[222px] overflow-y-auto [&::-webkit-scrollbar]:hidden'>
        <CommonWrapper skeletonType={SkeletonTypes.CUSTOM} isLoading={loading} loader={<WhoHasAccessSkeletonLoader />}>
          {pendingApprovals?.map((audience, index) => (
            <ShareResourceApprovalCard
              key={index}
              allTeams={allTeamsData ?? []}
              allAudience={audiencesData ?? []}
              audiencesData={data ?? []}
              audience={audience}
            />
          ))}
        </CommonWrapper>
      </div>
    </div>
  );
};

export default SharePopupPageApprovals;
