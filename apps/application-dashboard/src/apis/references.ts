import { API_ENDPOINTS } from 'apis/apiEndpoint.constants';
import { APITags } from '@/constants/api.constants';
import { baseApi } from '@/services/baseApi';
import type { ReferenceKindsResponse, ReferenceListRequest, ReferenceListResponse } from '@/types/api/references.types';

const References = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getReferenceKinds: builder.query<ReferenceKindsResponse, void>({
      query: () => ({ url: API_ENDPOINTS.REFERENCES_KINDS_GET }),
      providesTags: [APITags.GET_REFERENCE_KINDS],
    }),

    getReferenceList: builder.query<ReferenceListResponse, ReferenceListRequest>({
      query: ({ kind, q, limit, if_none_match }) => ({
        url: API_ENDPOINTS.REFERENCES_LIST_GET,
        params: {
          kind,
          ...(q ? { q } : {}),
          ...(limit ? { limit } : {}),
          ...(if_none_match ? { if_none_match } : {}),
        },
      }),
    }),
  }),
});

export const {
  useGetReferenceKindsQuery,
  useLazyGetReferenceKindsQuery,
  useGetReferenceListQuery,
  useLazyGetReferenceListQuery,
} = References;

export default References;
