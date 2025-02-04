export type AudiencesByOrganisationIdRequest = {
  organizationId: string;
};

export type AudiencesByOrganisationIdResponse = {
  user: {
    email: string;
    user_id: string;
    name: string;
  };
  privilege: string;
  resource_audience_type: string;
  resource_audience_id: string;
};

export type InvitedAudiencesByOrganisationIdResponse = {
  name: string;
  email: string;
  privilege: string;
};

export type PostAudiencesInviteData = {
  invitations: {
    email: string;
    role: string;
  }[];
};

export type PatchChangeAudienceRoleInOrganizationType = {
  organizationId: string;
  body: { user_id: string; role: string };
};

export type DeleteAudienceFromOrganizationAccessType = { organizationId: string; body: { user_id: string } };

export type GetMembershipRequestsByOrganizationIdRequest = { organizationId: string };

export type GetMembershipRequestsByOrganizationIdResponse = {
  id: string;
  organization_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string;
  status: string;
}[];
