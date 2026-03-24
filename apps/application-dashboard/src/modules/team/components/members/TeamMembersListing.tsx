import { FC, useMemo, useRef } from 'react';
import { TEAMS_COLORS } from '@zamp-platform/ui';
import {
  useGetAudiencesByOrganisationIdQuery,
  useGetTeamsByOrganizationIdQuery,
  useGetUserTeamsByOrganizationIdQuery,
} from 'apis/people';
import EmptyStateListing from 'modules/team/components/EmptyStateListing';
import TeamMemberCard from 'modules/team/components/members/TeamMemberCard';
import SkeletonLoaderListing from 'modules/team/components/SkeletonLoaderListing';
import { TEAM_MEMBERS_LISTING_COLUMN_DEFS } from 'modules/team/people.constants';
import { TeamMembersListingPropsType } from 'modules/team/people.types';
import { useUserIdentity } from '@/hooks/useUserIdentity';
import { cyclicIterator } from '@/utils/common';
import CommonWrapper from 'components/commonWrapper';
import { SkeletonTypes } from 'components/commonWrapper/commonWrapper.types';

const TeamMembersListing: FC<TeamMembersListingPropsType> = ({ data, isLoadingTeamMembersData, search }) => {
  const { organizationId } = useUserIdentity();
  const teamsRandomColorRef = useRef(cyclicIterator(TEAMS_COLORS));

  // get audiences data
  const { data: teamMembersData } = useGetAudiencesByOrganisationIdQuery(
    { organizationId },
    { skip: !organizationId, refetchOnMountOrArgChange: false },
  );

  // get user-wise teams data
  const { data: userTeamMembersData } = useGetUserTeamsByOrganizationIdQuery(
    { organizationId },
    { skip: !organizationId, refetchOnMountOrArgChange: false },
  );

  const hasAudiencesData = useMemo(() => (teamMembersData?.length ?? 0) > 0, [teamMembersData]);

  // get teams data
  const { data: teamsData } = useGetTeamsByOrganizationIdQuery(
    { organizationId },
    { skip: !organizationId, refetchOnMountOrArgChange: false },
  );

  // merge audiences and user-wise teams data
  const allAudiencesAndTeamsData = useMemo(
    () =>
      data?.map((user) => {
        const matchingUser = userTeamMembersData?.find((teamUser) => teamUser?.user_id === user?.user?.user_id);

        const teams =
          matchingUser?.teams?.map((team) => ({
            value: team?.name,
            label: team?.name,
            valid: true,
            color: team?.metadata?.color_hex_code,
            isNew: false,
            teamId: team?.team_id,
            teamMembershipId: team?.team_membership_id,
          })) || [];

        return {
          user_id: user?.user?.user_id,
          email: user?.user?.email,
          name: user?.user?.name,
          privilege: user?.privilege,
          teams,
        };
      }),
    [data, userTeamMembersData],
  );

  if (search && allAudiencesAndTeamsData?.length === 0) {
    return <EmptyStateListing title='No team members found' />;
  }

  return hasAudiencesData || isLoadingTeamMembersData ? (
    <>
      <div className='overflow-x-auto [scrollbar-width:none]'>
        <div className='min-w-[600px]'>
          <div className='border-b-0.5 border-DIVIDER_GRAY grid grid-cols-4 gap-4'>
            {TEAM_MEMBERS_LISTING_COLUMN_DEFS.map((column, index) => (
              <div key={index} className='px-2 py-2'>
                <span className='f-11-400 text-GRAY_700 text-left'>{column.headerName}</span>
              </div>
            ))}
          </div>
          <CommonWrapper
            isLoading={isLoadingTeamMembersData}
            skeletonType={SkeletonTypes.CUSTOM}
            loader={<SkeletonLoaderListing columns={4} length={12} />}
            className='h-[calc(100vh-270px)] overflow-y-auto [&::-webkit-scrollbar]:hidden'
          >
            {allAudiencesAndTeamsData?.map((row, index) => (
              <TeamMemberCard
                key={`${row?.user_id}-${index}`}
                member
                row={row}
                teamsData={teamsData ?? []}
                organizationId={organizationId}
                teamsRandomColorRef={teamsRandomColorRef}
                value={{ user_id: row?.user_id, privilege: row?.privilege, userEmail: row?.email }}
              />
            ))}
          </CommonWrapper>
        </div>
      </div>
    </>
  ) : (
    <EmptyStateListing title='No team members were added' />
  );
};

export default TeamMembersListing;
