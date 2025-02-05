export type SharePagePopupPropsType = {
  pageId: string;
};

export type PageAccessToAudiencesPropsType = {
  name?: string;
  resource_type: string;
  privilege?: string;
  pageId: string;
  resource_audience_id: string;
  resource_audience_type: string;
  user?: {
    email: string;
    name?: string;
  };
  userPrivilege: string;
};

export enum PAGE_ACCESS_PRIVILEGES {
  ADMIN = 'admin',
  VIEWER = 'viewer',
}

export type PageAccessPrivilegesType = {
  label: string;
  value: PAGE_ACCESS_PRIVILEGES;
};
