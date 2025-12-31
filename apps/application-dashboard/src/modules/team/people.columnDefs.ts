import MembersEmail from 'modules/team/components/members/MembersEmail';
import MembersName from 'modules/team/components/members/MembersName';
import MembersRole from 'modules/team/components/members/MembersRole';
import { MapAny } from 'types/commonTypes';

export const TEAM_MEMBERS_LISTING_COLUMN_DEFS = [
  {
    headerName: 'Name',
    field: 'user',
    valueFormatter: ({ value }: MapAny) => value.name || value?.email,
    cellRenderer: MembersName,
  },
  {
    headerName: 'Email',
    field: 'user',
    valueFormatter: ({ value }: MapAny) => value.email,
    cellRenderer: MembersEmail,
  },
  {
    headerName: 'Role',
    valueGetter: ({ data }: MapAny) => ({
      user_id: data?.user?.user_id,
      privilege: data?.privilege,
    }),
    cellRenderer: MembersRole,
  },
  {
    headerName: 'Team',
    field: 'team',
  },
];

export const INVITE_TEAM_MEMBERS_LISTING_COLUMN_DEFS = [
  {
    headerName: 'Name',
    field: 'email',
    cellRenderer: MembersName,
  },
  {
    headerName: 'Email',
    field: 'email',
    cellRenderer: MembersEmail,
  },
  {
    headerName: 'Invited as',
    field: 'privilege',
    cellRenderer: MembersRole,
  },
];

export const TEAM_MEMBERS_LISTING_TABLE_THEME = {
  rowHeight: 44,
  rowHoverColor: 'transparent',
  cellHorizontalPadding: 8,
};
