import { API_ENDPOINTS, REQUEST_TYPES } from 'apis/apiEndpoint.constants';
import baseApi from 'services/api';
import { APITags } from '@/constants/api.constants';
import {
  CreateTemplatePayloadType,
  DestinationAccountPayloadType,
  InitiatePaymentPayloadType,
  PaymentConfigResponseType,
  RecipientBySourceAccountPayloadType,
  RecipientBySourceAccountResponseType,
  RecipientDetailsType,
  SourceAccountByRecipientIdPayloadType,
  SourceAccountResponseType,
  TemplateListResponseType,
} from '@/types/api/paymentApi.types';

const Payments = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSourceAccounts: builder.query<SourceAccountResponseType, SourceAccountByRecipientIdPayloadType>({
      query: (params) => ({
        url: API_ENDPOINTS.PAYMENTS_SOURCE_ACCOUNTS_GET,
        params,
      }),
    }),
    getRecipientList: builder.query<RecipientDetailsType[], void>({
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
    getTemplateList: builder.query<TemplateListResponseType, void>({
      query: () => ({
        url: API_ENDPOINTS.PAYMENTS_TEMPLATE_LIST_GET,
      }),
      providesTags: [APITags.GET_PAYMENT_TEMPLATE_LIST],
    }),
    getPaymentConfig: builder.query<PaymentConfigResponseType, void>({
      query: () => ({
        url: API_ENDPOINTS.PAYMENTS_CONFIG_GET,
      }),
    }),
    getRecipientBySourceAccount: builder.query<
      RecipientBySourceAccountResponseType,
      RecipientBySourceAccountPayloadType
    >({
      query: (params) => ({
        url: API_ENDPOINTS.PAYMENTS_RECIPIENT_BY_SOURCE_ACCOUNT_GET,
        params,
      }),
    }),
    createTemplate: builder.mutation<SourceAccountResponseType, CreateTemplatePayloadType>({
      query: (body) => ({
        url: API_ENDPOINTS.PAYMENTS_TEMPLATE_CREATE_POST,
        method: REQUEST_TYPES.POST,
        body,
      }),
      invalidatesTags: [APITags.GET_PAYMENT_TEMPLATE_LIST],
    }),
    initiatePayment: builder.mutation<SourceAccountResponseType, InitiatePaymentPayloadType>({
      query: (body) => ({
        url: API_ENDPOINTS.PAYMENTS_INITIATE_PAYMENT_POST,
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
  useGetRecipientBySourceAccountQuery,
  useLazyGetRecipientBySourceAccountQuery,
  useInitiatePaymentMutation,
  useGetPaymentConfigQuery,
} = Payments;
