import { API_ENDPOINTS } from 'apis/apiEndpoint.constants';
import baseApi from 'services/api';
import { AudiencesByOrganisationIdRequest, AudiencesByOrganisationIdResponse } from 'types/api/people.types';
import { formRequestUrlWithParams } from 'utils/common';

const People = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAudiencesByOrganisationId: builder.query<AudiencesByOrganisationIdResponse[], AudiencesByOrganisationIdRequest>({
      query: ({ organizationId }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.AUDIENCES_BY_ORGANIZATION_ID_GET, { organizationId }),
      }),
      transformResponse: (data) => data,
    }),
  }),
});

export const { useGetAudiencesByOrganisationIdQuery } = People;
