import { API_ENDPOINTS, REQUEST_TYPES } from 'apis/apiEndpoint.constants';
import baseApi from 'services/api';
import { SignedUrlBodyType, UploadFileResponseType } from '@/types/api/fileUpload.types';

const FileUpload = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSignedUrl: builder.mutation<UploadFileResponseType, SignedUrlBodyType>({
      query: (payload) => ({
        url: API_ENDPOINTS.DATASET_SIGNED_UPLOAD_URL_POST,
        method: REQUEST_TYPES.POST,
        body: payload,
      }),
    }),
  }),
});

export const { useGetSignedUrlMutation } = FileUpload;
