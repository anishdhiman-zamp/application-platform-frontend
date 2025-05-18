import { FC, useEffect, useState } from 'react';
import ApprovalPendingListing from 'modules/team/components/members/ApprovalPendingListing';
import InvitedMembersListing from 'modules/team/components/members/InvitedMembersListing';
import TeamMembersListing from 'modules/team/components/members/TeamMembersListing';
import { TEAM_TABS_TYPES, TeamTabsList } from 'modules/team/people.types';
import { useRouter } from 'next/router';
import { AudiencesByOrganisationIdResponse, InvitedAudiencesByOrganisationIdResponse } from 'types/api/people.types';
import { MenuItem, TAB_TYPES } from 'types/common/components';
import { checkIfCurrentUserIsMember } from 'utils/accessPermission/accessPermission.utils';
import { ROUTES_PATH } from '@/constants/routeConfig';
import { Tabs } from 'components/common/tabs/Tabs';
type PeopleTabsPropsType = {
  filteredTeamMembers: AudiencesByOrganisationIdResponse[];
  isLoadingTeamMembersData: boolean;
  filteredInvitedMembers: InvitedAudiencesByOrganisationIdResponse[];
  isLoadingInvitedTeamMembersData: boolean;
};

const PeopleTabs: FC<PeopleTabsPropsType> = ({
  filteredTeamMembers,
  isLoadingTeamMembersData,
  filteredInvitedMembers,
  isLoadingInvitedTeamMembersData,
}) => {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<TEAM_TABS_TYPES>();
  const checkIfSystemAdmin = !checkIfCurrentUserIsMember();

  const handleTabSelect = (item?: MenuItem) => {
    setSelectedTab(item?.value as TEAM_TABS_TYPES);
    router.replace(ROUTES_PATH.TEAM, { query: { tab: item?.value } });
  };

  const renderTeamListing = () => {
    switch (selectedTab) {
      case TEAM_TABS_TYPES.TEAM_MEMBERS:
        return <TeamMembersListing data={filteredTeamMembers} isLoadingTeamMembersData={isLoadingTeamMembersData} />;
      case TEAM_TABS_TYPES.INVITED_MEMBERS:
        return (
          <InvitedMembersListing
            data={filteredInvitedMembers}
            isLoadingInvitedTeamMembersData={isLoadingInvitedTeamMembersData}
          />
        );
      case TEAM_TABS_TYPES.APPROVAL_PENDING:
        return <ApprovalPendingListing />;
      default:
        return null;
    }
  };

  useEffect(() => {
    const tab = router.query.tab;

    setSelectedTab((tab as TEAM_TABS_TYPES) ?? TEAM_TABS_TYPES.TEAM_MEMBERS);
  }, []);

  return (
    <>
      <div className='my-4'>
        {selectedTab && checkIfSystemAdmin && (
          <Tabs
            customSelectedIndex={TeamTabsList.findIndex((item) => item.value === selectedTab)}
            list={TeamTabsList}
            id='team-tabs'
            type={TAB_TYPES.UNDERLINE}
            onSelect={handleTabSelect}
          />
        )}
      </div>
      {renderTeamListing()}
    </>
  );
};

export default PeopleTabs;
