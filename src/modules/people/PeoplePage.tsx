import React from 'react';
import { useGetAudiencesByOrganisationIdQuery } from 'apis/people';
import { useAppSelector } from 'hooks/toolkit';
import TeamMembersListing from 'modules/people/components/teamMembers/TeamMembersListing';
import PeopleHeader from 'modules/people/PeopleHeader';
import { RootState } from 'store';

const PeoplePage = () => {
  const organizationId = useAppSelector((state: RootState) => state?.user?.user?.orgs?.[0]?.organization_id) ?? '';
  const { data } = useGetAudiencesByOrganisationIdQuery({ organizationId }, { skip: !organizationId });

  return (
    <div className='p-10 w-full h-full bg-white'>
      <PeopleHeader />
      {!!data?.length && <TeamMembersListing data={data} />}
    </div>
  );
};

export default PeoplePage;
