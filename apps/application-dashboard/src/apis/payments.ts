import { API_ENDPOINTS } from 'apis/apiEndpoint.constants';
import baseApi from 'services/api';
import { RecipientListResponseType, SourceAccountResponseType } from '@/types/api/paymentApi.types';

const Payments = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSourceAccounts: builder.query<SourceAccountResponseType, void>({
      query: () => ({
        url: API_ENDPOINTS.MOVE_MONEY_SOURCE_ACCOUNTS_GET,
      }),
    }),
    getRecipientList: builder.query<RecipientListResponseType, void>({
      query: () => ({
        url: API_ENDPOINTS.RECIPIENT_LIST_GET,
      }),
    }),
  }),
});

export const { useGetSourceAccountsQuery, useGetRecipientListQuery } = Payments;
