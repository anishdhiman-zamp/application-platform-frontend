import { API_ENDPOINTS, REQUEST_TYPES } from 'apis/apiEndpoint.constants';
import baseApi from 'services/api';
import {
  CreateTemplatePayloadType,
  DestinationAccountPayloadType,
  RecipientListResponseType,
  SourceAccountResponseType,
} from '@/types/api/paymentApi.types';

const Payments = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSourceAccounts: builder.query<SourceAccountResponseType, void>({
      query: () => ({
        url: API_ENDPOINTS.PAYMENTS_SOURCE_ACCOUNTS_GET,
      }),
    }),
    getRecipientList: builder.query<RecipientListResponseType, void>({
      query: () => ({
        url: API_ENDPOINTS.RECIPIENT_LIST_GET,
      }),
    }),
    getDestinationAccounts: builder.query<SourceAccountResponseType, DestinationAccountPayloadType>({
      query: (params) => ({
        url: API_ENDPOINTS.PAYMENTS_DESTINATION_ACCOUNTS_GET,
        params,
      }),
    }),
    getTemplateList: builder.query<SourceAccountResponseType, void>({
      query: () => ({
        url: API_ENDPOINTS.PAYMENTS_TEMPLATE_LIST_GET,
      }),
    }),
    createTemplate: builder.mutation<SourceAccountResponseType, CreateTemplatePayloadType>({
      query: (body) => ({
        url: API_ENDPOINTS.PAYMENTS_TEMPLATE_CREATE_POST,
        method: REQUEST_TYPES.POST,
        body,
      }),
    }),
  }),
});

export const {
  useGetSourceAccountsQuery,
  useGetRecipientListQuery,
  useGetDestinationAccountsQuery,
  useLazyGetDestinationAccountsQuery,
  useGetTemplateListQuery,
  useCreateTemplateMutation,
} = Payments;
