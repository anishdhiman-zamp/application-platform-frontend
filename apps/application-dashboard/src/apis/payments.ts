import { API_ENDPOINTS, REQUEST_TYPES } from 'apis/apiEndpoint.constants';
import baseApi from 'services/api';
import { APITags } from '@/constants/api.constants';
import {
  DatasetDataRequestType,
  DatasetDataResponseType,
  DatasetFilterConfigResponseType,
} from '@/types/api/dataset.types';
import {
  CreateTemplatePayloadType,
  DestinationAccountPayloadType,
  InitiatePaymentPayloadType,
  type PaymentApprovalsInfoResponseType,
  PaymentConfigResponseType,
  PaymentDetailsResponseType,
  RecipientBySourceAccountPayloadType,
  RecipientBySourceAccountResponseType,
  RecipientDetailsType,
  SourceAccountByRecipientIdPayloadType,
  SourceAccountResponseType,
  TemplateListResponseType,
} from '@/types/api/paymentApi.types';
import { formRequestUrlWithParams } from '@/utils/common';

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
    getPaymentListDatasetFilterConfig: builder.query<DatasetFilterConfigResponseType[], void>({
      query: () => ({
        url: API_ENDPOINTS.PAYMENT_LIST_FILTER_CONFIG_GET,
      }),
      transformResponse: ({ data }) => data,
    }),
    getPaymentList: builder.query<DatasetDataResponseType, DatasetDataRequestType>({
      query: ({ query_config }) => ({
        url: API_ENDPOINTS.PAYMENT_LIST_GET,
        params: { query_config },
      }),
    }),
    getPaymentDetails: builder.query<PaymentDetailsResponseType, string>({
      query: (paymentId) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.PAYMENT_DETAILS_GET, { paymentId }),
      }),
    }),
    getPaymentApprovalsInfo: builder.query<PaymentApprovalsInfoResponseType, string>({
      query: (paymentId) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.PAYMENTS_APPROVALS_INFO_GET, { paymentId }),
      }),
      providesTags: [APITags.GET_PAYMENT_APPROVALS_INFO],
    }),
    getTemplateApprovalsInfo: builder.query<PaymentApprovalsInfoResponseType, string>({
      query: (templateId) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.PAYMENTS_TEMPLATE_APPROVALS_INFO_GET, { templateId }),
      }),
      providesTags: [APITags.GET_PAYMENT_APPROVALS_INFO],
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
  useGetPaymentListDatasetFilterConfigQuery,
  useLazyGetPaymentListQuery,
  useGetPaymentDetailsQuery,
  useGetPaymentApprovalsInfoQuery,
  useGetTemplateApprovalsInfoQuery,
} = Payments;
