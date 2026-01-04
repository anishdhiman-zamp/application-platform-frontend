import { FC, useMemo } from 'react';
import { useGetInvitedAudiencesByOrganisationIdQuery } from 'apis/people';
import EmptyStateListing from 'modules/team/components/EmptyStateListing';
import InvitedMemberCard from 'modules/team/components/members/InvitedMemberCard';
import SkeletonLoaderListing from 'modules/team/components/SkeletonLoaderListing';
import { INVITE_TEAM_MEMBERS_LISTING_COLUMN_DEFS } from 'modules/team/people.columnDefs';
import { InvitedMembersListingPropsType } from 'modules/team/people.types';
import { useCurrentUser } from '@/hooks/useUserPrivilege';
import CommonWrapper from 'components/commonWrapper';
import { SkeletonTypes } from 'components/commonWrapper/commonWrapper.types';

const InvitedMembersListing: FC<InvitedMembersListingPropsType> = ({
  data,
  isLoadingInvitedTeamMembersData,
  search,
}) => {
  const reversedData = useMemo(() => data?.slice().reverse(), [data]);
  const { organizationId } = useCurrentUser();
  const { data: invitedTeamMembersData } = useGetInvitedAudiencesByOrganisationIdQuery(
    { organizationId },
    { skip: !organizationId, refetchOnMountOrArgChange: false },
  );

  const hasData = (invitedTeamMembersData?.length ?? 0) > 0;

  if (search && reversedData?.length === 0) {
    return <EmptyStateListing title='No pending invitations found' />;
  }

  return hasData || isLoadingInvitedTeamMembersData ? (
    <>
      <div className='border-b-0.5 border-DIVIDER_GRAY grid grid-cols-3 gap-4'>
        {INVITE_TEAM_MEMBERS_LISTING_COLUMN_DEFS.map((column, index) => (
          <div key={index} className='px-2 py-2'>
            <span className='f-11-400 text-GRAY_700 text-left'>{column.headerName}</span>
          </div>
        ))}
      </div>
      <CommonWrapper
        isLoading={isLoadingInvitedTeamMembersData}
        skeletonType={SkeletonTypes.CUSTOM}
        loader={<SkeletonLoaderListing columns={3} length={12} />}
        className='h-[calc(100vh-270px)] overflow-x-hidden overflow-y-auto [&::-webkit-scrollbar]:hidden'
      >
        {reversedData?.map((row, index) => (
          <InvitedMemberCard key={`${row?.email}-${index}`} row={row} organizationId={organizationId} />
        ))}
      </CommonWrapper>
    </>
  ) : (
    <EmptyStateListing title='No pending invitations' />
  );
};

export default InvitedMembersListing;
