import { useState } from 'react';
import { useGetAudiencesByOrganisationIdQuery, useGetInvitedAudiencesByOrganisationIdQuery } from 'apis/people';
import { useAppSelector } from 'hooks/toolkit';
import InvitedMembersListing from 'modules/people/components/invitedMembers/InvitedMembersListing';
import TeamMembersListing from 'modules/people/components/teamMembers/TeamMembersListing';
import { PEOPLE_TABS_LIST } from 'modules/people/people.constants';
import { RootState } from 'store';
import { MenuItem, TAB_TYPES } from 'types/common/components';
import { checkIfCurrentUserIsMember } from 'utils/accessPermission/accessPermission.utils';
import { Tabs } from 'components/common/tabs/Tabs';

const PeopleTabs = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const organizationId = useAppSelector((state: RootState) => state?.user?.user?.orgs?.[0]?.organization_id) ?? '';
  const { data: teamMembersData } = useGetAudiencesByOrganisationIdQuery({ organizationId }, { skip: !organizationId });
  const { data: invitedTeamMembersData } = useGetInvitedAudiencesByOrganisationIdQuery(
    { organizationId },
    { skip: !organizationId },
  );
  const checkIfSystemAdmin = !checkIfCurrentUserIsMember();
  const handleTabSelect = (selectedItem?: MenuItem) => {
    setSelectedTab(PEOPLE_TABS_LIST.findIndex((item) => item.value === selectedItem?.value));
  };

  return (
    <>
      <div className='my-4'>
        {checkIfSystemAdmin && (
          <Tabs
            list={PEOPLE_TABS_LIST}
            id='PEOPLE_TAB'
            type={TAB_TYPES.UNDERLINE}
            onSelect={handleTabSelect}
            customSelectedIndex={selectedTab}
          />
        )}
      </div>
      {selectedTab === 0
        ? !!teamMembersData?.length && <TeamMembersListing data={teamMembersData} />
        : !!invitedTeamMembersData?.length && <InvitedMembersListing data={invitedTeamMembersData} />}
    </>
  );
};

export default PeopleTabs;
