'use client';

import { FC, useEffect, useMemo, useState } from 'react';
import { useGetAudiencesByOrganisationIdQuery, useGetInvitedAudiencesByOrganisationIdQuery } from 'apis/people';
import { debounce } from 'hooks';
import PeopleHeader from 'modules/team/components/PeopleHeader';
import PeopleTabs from 'modules/team/components/PeopleTabs';
import type { TEAM_TABS_TYPES } from 'modules/team/people.types';
import { convertEmailUsernameToName, getUserNameFromEmail } from 'utils/common';
import { useCurrentUser } from '@/hooks/useUserPrivilege';

interface PeoplePageProps {
  tab?: TEAM_TABS_TYPES;
}

const PeoplePage: FC<PeoplePageProps> = ({ tab }) => {
  const { organizationId } = useCurrentUser();

  const {
    data: teamMembersData,
    isLoading: isLoadingTeamMembersData,
    isUninitialized: isUninitializedTeamMembersData,
  } = useGetAudiencesByOrganisationIdQuery(
    { organizationId },
    { skip: !organizationId, refetchOnMountOrArgChange: false },
  );
  const {
    data: invitedTeamMembersData,
    isLoading: isLoadingInvitedTeamMembersData,
    isUninitialized: isUninitializedInvitedTeamMembersData,
  } = useGetInvitedAudiencesByOrganisationIdQuery({ organizationId }, { skip: !organizationId });

  const [search, setSearch] = useState('');
  const [filteredTeamMembers, setFilteredTeamMembers] = useState(teamMembersData);
  const [filteredInvitedMembers, setFilteredInvitedMembers] = useState(invitedTeamMembersData);

  const debouncedFilterTeamMembers = useMemo(
    () =>
      debounce((searchValue: string) => {
        setFilteredTeamMembers(
          teamMembersData?.filter((member) =>
            convertEmailUsernameToName(getUserNameFromEmail(member?.user?.email))
              ?.toLowerCase()
              .startsWith(searchValue?.toLowerCase()),
          ),
        );
      }, 300),
    [teamMembersData],
  );

  const debouncedFilterInvitedMembers = useMemo(
    () =>
      debounce((searchValue: string) => {
        setFilteredInvitedMembers(
          invitedTeamMembersData?.filter((member) =>
            convertEmailUsernameToName(getUserNameFromEmail(member?.email))
              ?.toLowerCase()
              .startsWith(searchValue?.toLowerCase()),
          ),
        );
      }, 300),
    [invitedTeamMembersData],
  );

  useEffect(() => {
    debouncedFilterTeamMembers(search);
    debouncedFilterInvitedMembers(search);
  }, [search, debouncedFilterTeamMembers, debouncedFilterInvitedMembers]);

  return (
    <div className='h-full w-full p-10'>
      <PeopleHeader search={search} setSearch={setSearch} teamMembersData={teamMembersData ?? []} />

      <PeopleTabs
        filteredTeamMembers={filteredTeamMembers ?? []}
        isLoadingTeamMembersData={isLoadingTeamMembersData || isUninitializedTeamMembersData}
        filteredInvitedMembers={filteredInvitedMembers ?? []}
        isLoadingInvitedTeamMembersData={isLoadingInvitedTeamMembersData || isUninitializedInvitedTeamMembersData}
        search={search}
        tab={tab}
      />
    </div>
  );
};

export default PeoplePage;
