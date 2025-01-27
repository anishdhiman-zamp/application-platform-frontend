import { FC } from 'react';
import { INVITE_TEAM_MEMBERS_LISTING_COLUMN_DEFS, TEAM_MEMBERS_LISTING_TABLE_THEME } from 'modules/people/people.constants';
import { InvitedMembersListingPropsType } from 'modules/people/people.types';
import DataTable from 'components/common/table/DataTable';

const InvitedMembersListing: FC<InvitedMembersListingPropsType> = ({ data = [] }) => {
  return (
    data && (
      <DataTable
        columns={INVITE_TEAM_MEMBERS_LISTING_COLUMN_DEFS}
        rows={data}
        overrideThemeParams={TEAM_MEMBERS_LISTING_TABLE_THEME}
      />
    )
  );
};

export default InvitedMembersListing;
