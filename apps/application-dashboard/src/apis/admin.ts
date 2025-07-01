import { REQUEST_TYPES } from '@zamp-platform/api';
import { API_ENDPOINTS } from 'apis/apiEndpoint.constants';
import {
  AdminDatasetListingResponseType,
  CreateDatasetRequestType,
  CreateDatasetResponseType,
  GetDatasetDagResponseType,
  GetDatasetDisplayConfigRequestType,
  GetDatasetDisplayConfigResponseType,
  GetTemplatesRequestType,
  GetTemplatesResponseType,
  PostDatasetDisplayConfigRequestType,
  PostDatasetDisplayConfigResponseType,
  TransformDatasetRequestType,
  TransformDatasetResponseType,
  UpdateDatasetRequestType,
  UpdateDatasetResponseType,
  UpsertTemplateRequestType,
  UpsertTemplateResponseType,
} from 'types/api/admin.types';
import { formRequestUrlWithParams } from 'utils/common';
import { baseApi } from '@/services/baseApi';

const Admin = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDatasetDisplayConfig: builder.query<GetDatasetDisplayConfigResponseType, GetDatasetDisplayConfigRequestType>({
      query: ({ datasetId }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.ADMIN_DATASET_DISPLAY_CONFIG_GET, { datasetId }),
      }),
    }),
    postDatasetDisplayConfig: builder.mutation<
      PostDatasetDisplayConfigResponseType,
      PostDatasetDisplayConfigRequestType
    >({
      query: ({ datasetId, body }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.ADMIN_DATASET_DISPLAY_CONFIG_POST, { datasetId }),
        method: REQUEST_TYPES.POST,
        body: body,
      }),
    }),
    getDatasetDag: builder.query<GetDatasetDagResponseType, void>({
      query: () => ({
        url: API_ENDPOINTS.ADMIN_DATASET_DAG_GET,
      }),
    }),
    transformDataset: builder.mutation<TransformDatasetResponseType, TransformDatasetRequestType>({
      query: (body) => ({
        url: API_ENDPOINTS.ADMIN_DATASET_TRANSFORM_POST,
        method: REQUEST_TYPES.POST,
        body: body,
      }),
    }),
    createDataset: builder.mutation<CreateDatasetResponseType, CreateDatasetRequestType>({
      query: (body) => ({
        url: API_ENDPOINTS.ADMIN_DATASET_CREATE_POST,
        method: REQUEST_TYPES.POST,
        body: body,
      }),
    }),
    getAllDatasets: builder.query<AdminDatasetListingResponseType, void>({
      query: () => ({
        url: API_ENDPOINTS.ADMIN_DATASET_ALL_GET,
      }),
    }),
    getTemplates: builder.mutation<GetTemplatesResponseType, GetTemplatesRequestType>({
      query: (body) => ({
        url: API_ENDPOINTS.ADMIN_DATASET_TEMPLATES_GET,
        method: REQUEST_TYPES.POST,
        body: body,
      }),
    }),
    updateDataset: builder.mutation<UpdateDatasetResponseType, UpdateDatasetRequestType>({
      query: ({ datasetId, ...rest }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.ADMIN_DATASET_UPDATE_PATCH, { datasetId }),
        method: REQUEST_TYPES.PATCH,
        body: rest,
      }),
    }),
    upsertTemplate: builder.mutation<UpsertTemplateResponseType, UpsertTemplateRequestType>({
      query: (body) => ({
        url: API_ENDPOINTS.ADMIN_DATASET_TEMPLATES_UPSERT_POST,
        method: REQUEST_TYPES.POST,
        body: body,
      }),
    }),
  }),
});

export const {
  useGetDatasetDisplayConfigQuery,
  usePostDatasetDisplayConfigMutation,
  useGetDatasetDagQuery,
  useTransformDatasetMutation,
  useCreateDatasetMutation,
  useGetAllDatasetsQuery,
  useGetTemplatesMutation,
  useUpdateDatasetMutation,
  useUpsertTemplateMutation,
} = Admin;
