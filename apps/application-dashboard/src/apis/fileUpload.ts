import { REQUEST_TYPES } from '@zamp-platform/api';
import { baseApi } from '@/services/baseApi';
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
