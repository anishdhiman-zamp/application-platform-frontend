import { useState } from 'react';
import { useGetAudiencesByOrganisationIdQuery } from 'apis/people';
import { useAppSelector } from 'hooks/toolkit';
import TeamMembersListing from 'modules/people/components/teamMembers/TeamMembersListing';
import { PEOPLE_TABS_LIST } from 'modules/people/people.constants';
import { RootState } from 'store';
import { MenuItem, TAB_TYPES } from 'types/common/components';
import { Tabs } from 'components/common/tabs/Tabs';

const PeopleTabs = () => {
  const organizationId = useAppSelector((state: RootState) => state?.user?.user?.orgs?.[0]?.organization_id) ?? '';
  const { data: teamMembersData } = useGetAudiencesByOrganisationIdQuery({ organizationId }, { skip: !organizationId });

  const [selectedTab, setSelectedTab] = useState(0);

  const handleTabSelect = (selectedItem?: MenuItem) => {
    setSelectedTab(PEOPLE_TABS_LIST.findIndex((item) => item.value === selectedItem?.value));
  };

  return (
    <>
      <div className='my-4'>
        <Tabs
          list={PEOPLE_TABS_LIST}
          id='PEOPLE_TAB'
          type={TAB_TYPES.UNDERLINE}
          onSelect={handleTabSelect}
          customSelectedIndex={selectedTab}
        />
      </div>
      {selectedTab === 0 && !!teamMembersData?.length && <TeamMembersListing data={teamMembersData} />}
    </>
  );
};

export default PeopleTabs;
