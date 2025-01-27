import { Session } from 'types/api/auth.types';

export type AudiencesByOrganisationIdRequest = {
  organizationId: string;
};

export type AudiencesByOrganisationIdResponse = {
  user: Session;
  privilege: string;
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
