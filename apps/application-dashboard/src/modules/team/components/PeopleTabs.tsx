'use client';

import { FC, useEffect, useMemo, useState } from 'react';
import ApprovalPendingListing from 'modules/team/components/members/ApprovalPendingListing';
import InvitedMembersListing from 'modules/team/components/members/InvitedMembersListing';
import TeamMembersListing from 'modules/team/components/members/TeamMembersListing';
import { TEAM_TABS_TYPES, TeamTabsList } from 'modules/team/people.types';
import { useRouter, useSearchParams } from 'next/navigation';
import { AudiencesByOrganisationIdResponse, InvitedAudiencesByOrganisationIdResponse } from 'types/api/people.types';
import { MenuItem, TAB_TYPES } from 'types/common/components';
import { checkIfCurrentUserIsMember } from 'utils/accessPermission/accessPermission.utils';
import { useGetDualAdminPolicyQuery } from '@/apis/people';
import { ROUTES_PATH } from '@/constants/routeConfig';
import { Tabs } from 'components/common/tabs/Tabs';

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
  const [selectedTab, setSelectedTab] = useState<TEAM_TABS_TYPES>();
  const checkIfSystemAdmin = !checkIfCurrentUserIsMember();
  const { data: dualAdminPolicy } = useGetDualAdminPolicyQuery();

  const hasPeoplePolicy = useMemo(() => {
    return !!dualAdminPolicy?.find((policy) => policy.name === 'People')?.policy;
  }, [dualAdminPolicy]);

  useEffect(() => {
    const tab = searchParams?.get('tab');

    setSelectedTab((tab as TEAM_TABS_TYPES) ?? TEAM_TABS_TYPES.TEAM_MEMBERS);
  }, []);

  const handleTabSelect = (item?: MenuItem) => {
    if (!item?.value) return;
    setSelectedTab(item.value as TEAM_TABS_TYPES);
    const params = new URLSearchParams(searchParams?.toString() || '');

    params.set('tab', String(item.value));
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
          />
        );
      case TEAM_TABS_TYPES.INVITED_MEMBERS:
        return (
          <InvitedMembersListing
            data={filteredInvitedMembers}
            isLoadingInvitedTeamMembersData={isLoadingInvitedTeamMembersData}
          />
        );
      case TEAM_TABS_TYPES.APPROVAL_PENDING:
        return <ApprovalPendingListing search={search} />;
      default:
        return null;
    }
  };

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
