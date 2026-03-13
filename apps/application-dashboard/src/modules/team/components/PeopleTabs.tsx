'use client';

import { FC, useTransition } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@zamp-platform/ui';
import InvitedMembersListing from 'modules/team/components/members/InvitedMembersListing';
import TeamMembersListing from 'modules/team/components/members/TeamMembersListing';
import { TEAM_TABS_TYPES, TeamTabsList } from 'modules/team/people.types';
import { usePathname, useRouter } from 'next/navigation';
import { AudiencesByOrganisationIdResponse, InvitedAudiencesByOrganisationIdResponse } from 'types/api/people.types';
import { useUserIdentity } from '@/hooks/useUserIdentity';

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
  const pathname = usePathname();
  const router = useRouter();
  const [, startTransition] = useTransition();
  const defaultTab = tab ?? TEAM_TABS_TYPES.TEAM_MEMBERS;

  const { isSystemAdmin, userRole } = useUserIdentity();

  const handleTabSelect = (value: string) => {
    if (!value) return;

    startTransition(() => {
      router.replace(`${pathname}?tab=${value}`);
    });
  };

  if (userRole && !isSystemAdmin) {
    return (
      <TeamMembersListing
        data={filteredTeamMembers}
        isLoadingTeamMembersData={isLoadingTeamMembersData}
        search={search}
      />
    );
  }

  return (
    <Tabs defaultValue={defaultTab} onValueChange={handleTabSelect} className='my-4 h-full w-full'>
      <TabsList className='bg-transparent'>
        {TeamTabsList.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            data-testid={`tabs-v2-trigger-${tab.value}`}
            className='f-12-500 data-[state=active]:text-GRAY_1000 group hover:bg-GRAY_100 relative !rounded !border-none !p-0 !px-2 !py-3.5 data-[state=active]:!bg-transparent data-[state=active]:!shadow-none data-[state=active]:!ring-0'
          >
            {tab.label}
            <div className='bg-GRAY_1000 absolute -bottom-0.5 left-0 hidden h-0.5 w-full group-data-[state=active]:block' />
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value={TEAM_TABS_TYPES.TEAM_MEMBERS} className='h-full w-full'>
        <TeamMembersListing
          data={filteredTeamMembers}
          isLoadingTeamMembersData={isLoadingTeamMembersData}
          search={search}
        />
      </TabsContent>

      <TabsContent value={TEAM_TABS_TYPES.INVITED_MEMBERS} className='h-full w-full'>
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
