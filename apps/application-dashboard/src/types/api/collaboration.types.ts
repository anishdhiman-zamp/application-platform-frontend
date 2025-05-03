import { ResourceAudienceType } from 'types/api/auth.types';

export type AudiencesByResourceIdRequest = {
  resourceRoute: string;
  resourceId: string;
};

export type AddAudiencesToResourcePayload = {
  audiences: {
    audience_type: string;
    audience_id: string;
    role: string;
  }[];
};

export type DeleteAudiencesFromResourcePayload = {
  audience_id: string;
};

type withResource<T> = T & AudiencesByResourceIdRequest;

export type ChangeAudienceRoleInResourcePayload = withResource<{
  audience_id: string;
  role: string;
}>;

export type PostShareResourceToAudiencesType = withResource<{
  body: AddAudiencesToResourcePayload;
}>;

export type DeleteResourceFromAudiencesType = withResource<{
  body: DeleteAudiencesFromResourcePayload;
}>;

export type ChangeAudienceRoleInResourceType = withResource<{
  body: ChangeAudienceRoleInResourcePayload;
}>;

export type AudiencesByResourceResponse = {
  resource_audience_type: ResourceAudienceType;
  resource_audience_id: string;
  privilege: string;
  resource_type: string;
  resource_id: string;
  user?: {
    role?: string;
    email?: string;
    user_id?: string;
    name?: string;
  };
};
