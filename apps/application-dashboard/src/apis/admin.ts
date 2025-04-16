import { API_ENDPOINTS, REQUEST_TYPES } from 'apis/apiEndpoint.constants';
import baseApi from 'services/api';
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
} from 'types/api/admin.types';
import { formRequestUrlWithParams } from 'utils/common';

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
} = Admin;
