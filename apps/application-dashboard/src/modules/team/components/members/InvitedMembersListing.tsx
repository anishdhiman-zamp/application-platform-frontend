import { FC, useMemo } from 'react';
import { cn } from '@zamp-platform/ui/utils';
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
  const reversedData = useMemo(() => data?.slice().reverse(), [data]);
  const organizationId = useAppSelector((state: RootState) => state?.user?.user?.orgs?.[0]?.organization_id) ?? '';
  const { data: invitedTeamMembersData } = useGetInvitedAudiencesByOrganisationIdQuery(
    { organizationId },
    { skip: !organizationId, refetchOnMountOrArgChange: false },
  );

  const hasData = (invitedTeamMembersData?.length ?? 0) > 0;

  return hasData || isLoadingInvitedTeamMembersData ? (
    <>
      <div className={`border-b-0.5 border-DIVIDER_GRAY gap-4`}>
        <div className='w-full'>
          <div className='border-GRAY_100 grid grid-cols-9 border-b'>
            {INVITE_TEAM_MEMBERS_LISTING_COLUMN_DEFS.map((column, index) => (
              <div key={index} className={cn('px-2 py-2 text-left', column.className)}>
                <span className='f-11-400 text-GRAY_700 text-left'>{column.headerName}</span>
              </div>
            ))}
          </div>
          <CommonWrapper
            isLoading={isLoadingInvitedTeamMembersData}
            skeletonType={SkeletonTypes.CUSTOM}
            loader={<SkeletonLoaderListing />}
            className='h-[calc(100vh-270px)] overflow-x-hidden overflow-y-auto [&::-webkit-scrollbar]:hidden'
          >
            {reversedData?.map((row, index) => (
              <InvitedMemberCard key={`${row?.email}-${index}`} row={row} organizationId={organizationId} />
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
