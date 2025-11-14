'use client';

import { FC, useMemo, useState } from 'react';
import InvitedMembersListing from 'modules/team/components/members/InvitedMembersListing';
import TeamMembersListing from 'modules/team/components/members/TeamMembersListing';
import { TEAM_TABS_TYPES, TeamTabsList } from 'modules/team/people.types';
import { useRouter, useSearchParams } from 'next/navigation';
import { AudiencesByOrganisationIdResponse, InvitedAudiencesByOrganisationIdResponse } from 'types/api/people.types';
import { checkIfCurrentUserIsMember } from 'utils/accessPermission/accessPermission.utils';
import { useGetDualAdminPolicyQuery } from '@/apis/people';
import { ROUTES_PATH } from '@/constants/routeConfig';
import { cn } from '@/utils/common';
import TabsV2 from 'components/common/tabs/TabsV2';

type PeopleTabsPropsType = {
  filteredTeamMembers: AudiencesByOrganisationIdResponse[];
  isLoadingTeamMembersData: boolean;
  filteredInvitedMembers: InvitedAudiencesByOrganisationIdResponse[];
  isLoadingInvitedTeamMembersData: boolean;
  search: string;
};

const PeopleTabs: FC<PeopleTabsPropsType> = ({
  filteredTeamMembers,
  isLoadingTeamMembersData,
  filteredInvitedMembers,
  isLoadingInvitedTeamMembersData,
  search,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams?.get('tab');

  const [selectedTab, setSelectedTab] = useState<TEAM_TABS_TYPES>(
    (tab as TEAM_TABS_TYPES) ?? TEAM_TABS_TYPES.TEAM_MEMBERS,
  );
  const checkIfSystemAdmin = !checkIfCurrentUserIsMember();
  const { data: dualAdminPolicy } = useGetDualAdminPolicyQuery();

  const hasPeoplePolicy = useMemo(() => {
    return !!dualAdminPolicy?.find((policy) => policy.name === 'People')?.policy;
  }, [dualAdminPolicy]);

  const handleTabSelect = (value: string) => {
    if (!value) return;
    setSelectedTab(value as TEAM_TABS_TYPES);
    const params = new URLSearchParams(searchParams?.toString() || '');

    params.set('tab', value);
    router.replace(`${ROUTES_PATH.TEAM}?${params.toString()}`);
  };

  const renderTeamListing = () => {
    switch (selectedTab) {
      case TEAM_TABS_TYPES.TEAM_MEMBERS:
        return (
          <TeamMembersListing
            hasPeoplePolicy={hasPeoplePolicy}
            data={filteredTeamMembers}
            isLoadingTeamMembersData={isLoadingTeamMembersData}
            search={search}
          />
        );
      case TEAM_TABS_TYPES.INVITED_MEMBERS:
        return (
          <InvitedMembersListing
            data={filteredInvitedMembers}
            isLoadingInvitedTeamMembersData={isLoadingInvitedTeamMembersData}
            search={search}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className='my-4'>
        {selectedTab && checkIfSystemAdmin && (
          <TabsV2
            tabsList={TeamTabsList}
            currentTab={selectedTab}
            onValueChange={handleTabSelect}
            listClassName='bg-transparent gap-x-5'
            triggerClassName={cn(
              'f-12-500 rounded-none !p-0 !px-1 !py-3',
              'box-border border-0 border-b-2 border-transparent',
              'data-[state=active]:!border-0 data-[state=active]:!border-b-2 data-[state=active]:!border-GRAY_1000 data-[state=active]:text-GRAY_1000',
            )}
            hideTabs={false}
          />
        )}
      </div>
      {renderTeamListing()}
    </>
  );
};

export default PeopleTabs;
