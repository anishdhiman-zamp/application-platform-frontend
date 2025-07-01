import { REQUEST_TYPES } from '@zamp-platform/api';
import { FormSchema } from '@zamp-platform/form-builder';
import { API_ENDPOINTS } from 'apis/apiEndpoint.constants';
import { baseApi } from '@/services/baseApi';

export type GetFormConfigRequestType = {
  form_id: string;
};

export type SubmitFormRequestType = {
  form_type: string;
  payload: Record<string, string | string[]>;
};

export type SubmitFormResponseType = {
  form_submission_id: string;
};

const Forms = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFormConfig: builder.query<FormSchema, GetFormConfigRequestType>({
      query: (params) => ({
        url: API_ENDPOINTS.FORMS_CONFIG_GET,
        params,
      }),
    }),
    submitForm: builder.mutation<SubmitFormResponseType, SubmitFormRequestType>({
      query: (body) => ({
        url: API_ENDPOINTS.FORMS_SUBMIT,
        method: REQUEST_TYPES.POST,
        body,
      }),
    }),
  }),
});

export const { useLazyGetFormConfigQuery, useGetFormConfigQuery, useSubmitFormMutation } = Forms;
