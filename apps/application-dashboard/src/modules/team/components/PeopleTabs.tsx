'use client';

import { FC, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@zamp-platform/ui';
import InvitedMembersListing from 'modules/team/components/members/InvitedMembersListing';
import TeamMembersListing from 'modules/team/components/members/TeamMembersListing';
import { TEAM_TABS_TYPES, TeamTabsList } from 'modules/team/people.types';
import { useRouter } from 'next/navigation';
import { AudiencesByOrganisationIdResponse, InvitedAudiencesByOrganisationIdResponse } from 'types/api/people.types';
import { useGetDualAdminPolicyQuery } from '@/apis/people';
import { ROUTES_PATH } from '@/constants/routeConfig';
import { useUserIdentity } from '@/hooks/useUserIdentity';
import { cn } from '@/utils/common';

interface PeopleTabsPropsType {
  filteredTeamMembers: AudiencesByOrganisationIdResponse[];
  isLoadingTeamMembersData: boolean;
  filteredInvitedMembers: InvitedAudiencesByOrganisationIdResponse[];
  isLoadingInvitedTeamMembersData: boolean;
  search: string;
  tab?: TEAM_TABS_TYPES;
}

const PeopleTabs: FC<PeopleTabsPropsType> = ({
  filteredTeamMembers,
  isLoadingTeamMembersData,
  filteredInvitedMembers,
  isLoadingInvitedTeamMembersData,
  search,
  tab,
}) => {
  const router = useRouter();
  const defaultTab = (tab as TEAM_TABS_TYPES) ?? TEAM_TABS_TYPES.TEAM_MEMBERS;

  const { isSystemAdmin } = useUserIdentity();
  const { data: dualAdminPolicy } = useGetDualAdminPolicyQuery();

  const hasPeoplePolicy = useMemo(() => {
    return !!dualAdminPolicy?.find((policy) => policy.name === 'People')?.policy;
  }, [dualAdminPolicy]);

  const handleTabSelect = (value: string) => {
    if (!value) return;
    router.replace(`${ROUTES_PATH.TEAM}?tab=${value}`);
  };

  if (!isSystemAdmin) {
    return (
      <TeamMembersListing
        hasPeoplePolicy={hasPeoplePolicy}
        data={filteredTeamMembers}
        isLoadingTeamMembersData={isLoadingTeamMembersData}
        search={search}
      />
    );
  }

  return (
    <Tabs value={defaultTab} onValueChange={handleTabSelect} className='w-full'>
      <TabsList className='mt-4 mb-2 gap-x-5 bg-transparent'>
        {TeamTabsList.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            data-testid={`tabs-v2-trigger-${tab.value}`}
            className={cn(
              'f-12-500 rounded-none !p-0 !px-1 !py-3',
              'box-border border-0 border-b-2 border-transparent',
              'data-[state=active]:!border-GRAY_1000 data-[state=active]:text-GRAY_1000 data-[state=active]:!border-0 data-[state=active]:!border-b-2',
            )}
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value={TEAM_TABS_TYPES.TEAM_MEMBERS}>
        <TeamMembersListing
          hasPeoplePolicy={hasPeoplePolicy}
          data={filteredTeamMembers}
          isLoadingTeamMembersData={isLoadingTeamMembersData}
          search={search}
        />
      </TabsContent>

      <TabsContent value={TEAM_TABS_TYPES.INVITED_MEMBERS}>
        <InvitedMembersListing
          data={filteredInvitedMembers}
          isLoadingInvitedTeamMembersData={isLoadingInvitedTeamMembersData}
          search={search}
        />
      </TabsContent>
    </Tabs>
  );
};

export default PeopleTabs;
