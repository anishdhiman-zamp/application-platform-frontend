import TeamMemberApprovalCard from 'modules/team/components/members/TeamMemberApprovalCard';
import SkeletonLoaderListing from 'modules/team/components/SkeletonLoaderListing';
import { RootState } from 'store';
import { useGetTeamPendingApprovalsQuery } from '@/apis/people';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import { useAppSelector } from '@/hooks/toolkit';
import useAudienceMembers from '@/hooks/useAudienceMembers';
import { ResourceType } from '@/modules/shareResource';
import NoWidgetData from '@/modules/widgets/components/NoWidgetData';
import { getUserNameFromAudience } from '@/utils/common';

const ApprovalPendingListing = () => {
  const organizationName = useAppSelector((state: RootState) => state?.user?.user?.orgs?.[0]?.name) ?? '';

  const { loading, audiencesData, allTeamsData } = useAudienceMembers({
    resourceType: ResourceType.ORGANIZATION,
    resourceId: '',
  });

  const {
    data: pendingApprovalsList,
    isLoading: isPendingApprovalsLoading,
    isError,
    refetch,
  } = useGetTeamPendingApprovalsQuery();

  const getUserDetails = (id: string) => {
    const user = audiencesData?.find((member) => member?.resource_audience_id === id);

    return {
      name: getUserNameFromAudience(user),
      email: user?.user?.email || '',
      privilege: user?.privilege || '',
    };
  };

  const getTeamDetails = (id: string) => {
    const team = allTeamsData?.find((team) => team?.team_id === id);

    return { name: team?.name || '', color: team?.metadata?.color_hex_code || '' };
  };

  return (
    <div>
      <div className='grid grid-cols-4 gap-4 text-GRAY_700 border-b border-GRAY_100 f-11-450 overflow-auto'>
        <div className='py-2.5 px-2'>Name</div>
        <div className='py-2.5 px-2'>Email</div>
        <div className='py-2.5 px-2'>Change</div>
        <div className='py-2.5 px-2'>Approval Status</div>
      </div>
      <CommonWrapper
        isLoading={loading || isPendingApprovalsLoading}
        skeletonType={SkeletonTypes.CUSTOM}
        loader={<SkeletonLoaderListing length={4} columns={4} />}
        noDataBanner={<NoWidgetData className='h-[400px]' text='No pending approvals' />}
        isNoData={pendingApprovalsList?.length === 0}
        isError={isError}
        className='min-h-[500px] overflow-y-auto h-[calc(100vh-270px)] [&::-webkit-scrollbar]:hidden'
        refetchFunction={refetch}
      >
        {pendingApprovalsList?.map((member) => (
          <TeamMemberApprovalCard
            key={member?.approval_id}
            name={getUserDetails(member?.audience_id ?? '')?.name || member?.email?.split('@')[0]}
            email={getUserDetails(member?.audience_id ?? '')?.email || member?.email}
            role={getUserDetails(member?.audience_id ?? '')?.privilege ?? ''}
            details={member}
            organization={organizationName}
            teamDetails={getTeamDetails(member?.team_id ?? '')}
          />
        ))}
      </CommonWrapper>
    </div>
  );
};

export default ApprovalPendingListing;
