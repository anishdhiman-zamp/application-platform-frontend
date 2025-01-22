import { Session } from 'types/api/auth.types';

export type AudiencesByOrganisationIdRequest = {
  organizationId: string;
};

export type AudiencesByOrganisationIdResponse = {
  user: Session;
  privilege: string;
};
