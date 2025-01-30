import { PAGE_ACCESS_PRIVILEGES } from 'modules/page/pages.types';

export const PAGE_ACCESS_PRIVILEGES_LIST = [
  {
    label: 'Admin',
    value: PAGE_ACCESS_PRIVILEGES.ADMIN,
  },
  {
    label: 'Viewer',
    value: PAGE_ACCESS_PRIVILEGES.VIEWER,
  },
];

export const CHANGE_PAGE_ACCESS_PRIVILEGES_LIST = [
  {
    label: 'Admin',
    value: PAGE_ACCESS_PRIVILEGES.ADMIN,
    desc: 'Can manage and share dataset',
  },
  {
    label: 'Viewer',
    value: PAGE_ACCESS_PRIVILEGES.VIEWER,
    desc: 'Can view data only',
  },
];
