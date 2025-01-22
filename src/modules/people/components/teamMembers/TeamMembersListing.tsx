import { FC } from 'react';
import { TEAM_MEMBERS_LISTING_COLUMN_DEFS, TEAM_MEMBERS_LISTING_TABLE_THEME } from 'modules/people/people.constants';
import { AudiencesByOrganisationIdResponse } from 'types/api/people.types';
import DataTable from 'components/common/table/DataTable';

interface TeamMembersListingProps {
  data: AudiencesByOrganisationIdResponse[];
}

const TeamMembersListing: FC<TeamMembersListingProps> = ({ data = [] }) => {
  return (
    data && (
      <DataTable
        columns={TEAM_MEMBERS_LISTING_COLUMN_DEFS}
        rows={data}
        overrideThemeParams={TEAM_MEMBERS_LISTING_TABLE_THEME}
      />
    )
  );
};

export default TeamMembersListing;
