import { API_ENDPOINTS, REQUEST_TYPES } from 'apis/apiEndpoint.constants';
import baseApi from 'services/api';
import { APITags } from '@/constants/api.constants';
import {
  DatasetDataRequestType,
  DatasetDataResponseType,
  DatasetFilterConfigResponseType,
} from '@/types/api/dataset.types';
import {
  CreatePolicyPayloadType,
  CreateTemplatePayloadType,
  DestinationAccountPayloadType,
  GetPoliciesParamsType,
  GetPoliciesResponseType,
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
      providesTags: [APITags.GET_RECIPIENT_LIST],
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
    addRecipient: builder.mutation<void, string>({
      query: (formId) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.RECIPIENT_CREATE_POST, { recipientId: formId }),
        method: REQUEST_TYPES.POST,
      }),
      invalidatesTags: [APITags.GET_RECIPIENT_LIST],
    }),
    addRecipientAccount: builder.mutation<void, { recipient_id: string; form_submission_id: string }>({
      query: (body) => ({
        url: API_ENDPOINTS.RECIPIENT_ACCOUNT_CREATE_POST,
        method: REQUEST_TYPES.POST,
        body,
      }),
      invalidatesTags: [APITags.GET_RECIPIENT_LIST],
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
    updatePolicy: builder.mutation<void, CreatePolicyPayloadType>({
      query: ({ config, name, url }) => ({
        url,
        method: REQUEST_TYPES.PATCH,
        body: { config, name },
      }),
      invalidatesTags: [APITags.GET_POLICY_LIST],
    }),
    createPolicy: builder.mutation<void, CreatePolicyPayloadType>({
      query: ({ url, ...body }) => ({
        url,
        method: REQUEST_TYPES.POST,
        body,
      }),
      invalidatesTags: [APITags.GET_POLICY_LIST],
    }),
    getPolicies: builder.query<GetPoliciesResponseType, GetPoliciesParamsType>({
      query: (params) => ({
        url: API_ENDPOINTS.POLICIES_GET,
        params,
      }),
      providesTags: [APITags.GET_POLICY_LIST],
    }),
    deletePolicy: builder.mutation<void, string>({
      query: (policyId) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.POLICY_DELETE, { policyId }),
        method: REQUEST_TYPES.DELETE,
      }),
      invalidatesTags: [APITags.GET_POLICY_LIST],
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
  useAddRecipientMutation,
  useAddRecipientAccountMutation,
  useGetPaymentListDatasetFilterConfigQuery,
  useLazyGetPaymentListQuery,
  useGetPaymentDetailsQuery,
  useCreatePolicyMutation,
  useUpdatePolicyMutation,
  useGetPaymentApprovalsInfoQuery,
  useLazyGetPoliciesQuery,
  useDeletePolicyMutation,
  useGetTemplateApprovalsInfoQuery,
} = Payments;
