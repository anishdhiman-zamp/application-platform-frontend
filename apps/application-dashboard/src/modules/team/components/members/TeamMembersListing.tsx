import { FC, useMemo, useRef } from 'react';
import {
  useGetAudiencesByOrganisationIdQuery,
  useGetTeamsByOrganizationIdQuery,
  useGetUserTeamsByOrganizationIdQuery,
} from 'apis/people';
import { useAppSelector } from 'hooks/toolkit';
import EmptyStateListing from 'modules/team/components/EmptyStateListing';
import MembersEmail from 'modules/team/components/members/MembersEmail';
import MembersName from 'modules/team/components/members/MembersName';
import MembersRole from 'modules/team/components/members/MembersRole';
import MembersTeamV2 from 'modules/team/components/members/MembersTeamV2';
import SkeletonLoaderListing from 'modules/team/components/SkeletonLoaderListing';
import { TEAM_MEMBERS_LISTING_COLUMN_DEFS } from 'modules/team/people.constants';
import { TeamMembersListingPropsType } from 'modules/team/people.types';
import { RootState } from 'store';
import { TEAMS_COLORS } from '@/constants/colors';
import { cyclicIterator } from '@/utils/common';
import CommonWrapper from 'components/commonWrapper';
import { SkeletonTypes } from 'components/commonWrapper/commonWrapper.types';

const TeamMembersListing: FC<TeamMembersListingPropsType> = ({ data, isLoadingTeamMembersData, hasPeoplePolicy }) => {
  const organizationId = useAppSelector((state: RootState) => state?.user?.user?.orgs?.[0]?.organization_id) ?? '';
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

  const hasAudiencesData = (teamMembersData?.length ?? 0) > 0;

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

  return hasAudiencesData || isLoadingTeamMembersData ? (
    <>
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
        loader={<SkeletonLoaderListing columns={4} />}
      >
        <div className='h-[calc(100vh-270px)] overflow-x-hidden overflow-y-auto [&::-webkit-scrollbar]:hidden'>
          {allAudiencesAndTeamsData?.map((row, index) => (
            <div key={index} className='border-b-0.5 border-DIVIDER_GRAY grid grid-cols-4 gap-4'>
              <MembersName value={row?.name || row?.email} member />
              <MembersEmail value={row?.email} />
              <MembersRole
                value={{ user_id: row?.user_id, privilege: row?.privilege, userEmail: row?.email }}
                member
                hasPeoplePolicy={hasPeoplePolicy}
              />
              <MembersTeamV2
                userInfo={{ user_id: row?.user_id, name: row?.name, email: row?.email }}
                organizationId={organizationId}
                teamsData={teamsData ?? []}
                userId={row?.user_id}
                userMappedTeams={row?.teams}
                hasPeoplePolicy={hasPeoplePolicy}
                teamsRandomColorRef={teamsRandomColorRef}
              />
            </div>
          ))}
        </div>
      </CommonWrapper>
    </>
  ) : (
    <EmptyStateListing title='No team members were added' />
  );
};

export default TeamMembersListing;
