import { FormSchema } from '@zamp-platform/form-builder';
import { API_ENDPOINTS, REQUEST_TYPES } from 'apis/apiEndpoint.constants';
import baseApi from 'services/api';

export type GetFormConfigRequestType = {
  form_id: string;
};

export type SubmitFormRequestType = {
  form_type: string;
  payload: Record<string, string | string[]>;
};

const Forms = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFormConfig: builder.query<FormSchema, GetFormConfigRequestType>({
      query: (params) => ({
        url: API_ENDPOINTS.FORMS_CONFIG_GET,
        params,
      }),
    }),
    submitForm: builder.mutation<void, SubmitFormRequestType>({
      query: (body) => ({
        url: API_ENDPOINTS.FORMS_SUBMIT,
        method: REQUEST_TYPES.POST,
        body,
      }),
    }),
  }),
});

export const { useGetFormConfigQuery, useSubmitFormMutation } = Forms;
