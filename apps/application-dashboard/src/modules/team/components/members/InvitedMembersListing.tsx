import { FC } from 'react';
import { cn } from '@zamp-platform/ui/lib/utils';
import { useGetInvitedAudiencesByOrganisationIdQuery } from 'apis/people';
import { useAppSelector } from 'hooks/toolkit';
import EmptyStateListing from 'modules/team/components/EmptyStateListing';
import InvitedMemberCard from 'modules/team/components/members/InvitedMemberCard';
import SkeletonLoaderListing from 'modules/team/components/SkeletonLoaderListing';
import { INVITE_TEAM_MEMBERS_LISTING_COLUMN_DEFS } from 'modules/team/people.constants';
import { InvitedMembersListingPropsType } from 'modules/team/people.types';
import { RootState } from 'store';
import CommonWrapper from 'components/commonWrapper';
import { SkeletonTypes } from 'components/commonWrapper/commonWrapper.types';

const InvitedMembersListing: FC<InvitedMembersListingPropsType> = ({ data, isLoadingInvitedTeamMembersData }) => {
  const organizationId = useAppSelector((state: RootState) => state?.user?.user?.orgs?.[0]?.organization_id) ?? '';
  const { data: invitedTeamMembersData } = useGetInvitedAudiencesByOrganisationIdQuery(
    { organizationId },
    { skip: !organizationId, refetchOnMountOrArgChange: false },
  );

  const hasData = (invitedTeamMembersData?.length ?? 0) > 0;

  return hasData || isLoadingInvitedTeamMembersData ? (
    <>
      <div className={` gap-4 border-b-0.5 border-DIVIDER_GRAY`}>
        <div className='w-full'>
          <div className='border-b border-GRAY_100 grid grid-cols-9'>
            {INVITE_TEAM_MEMBERS_LISTING_COLUMN_DEFS.map((column, index) => (
              <div key={index} className={cn('py-2 px-2 text-left', column.className)}>
                <span className='text-left f-11-400 text-GRAY_700'>{column.headerName}</span>
              </div>
            ))}
          </div>
          <CommonWrapper
            isLoading={isLoadingInvitedTeamMembersData}
            skeletonType={SkeletonTypes.CUSTOM}
            loader={<SkeletonLoaderListing />}
            className='overflow-y-auto h-[calc(100vh-270px)] [&::-webkit-scrollbar]:hidden'
          >
            {data.map((row, index) => (
              <InvitedMemberCard key={index} row={row} organizationId={organizationId} />
            ))}
          </CommonWrapper>
        </div>
      </div>
    </>
  ) : (
    <EmptyStateListing title='No pending invitations' />
  );
};

export default InvitedMembersListing;
