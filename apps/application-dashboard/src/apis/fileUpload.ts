import { REQUEST_TYPES } from 'apis/apiEndpoint.constants';
import baseApi from 'services/api';
import { SignedUrlBodyType, SignedUrlResponseType } from '@/types/api/fileUpload.types';

const FileUpload = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSignedUrl: builder.mutation<SignedUrlResponseType, SignedUrlBodyType>({
      query: ({ path, payload }) => ({
        url: path,
        method: REQUEST_TYPES.POST,
        body: payload,
      }),
    }),
  }),
});

export const { useGetSignedUrlMutation } = FileUpload;
