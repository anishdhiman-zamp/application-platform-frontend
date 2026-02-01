import { REQUEST_TYPES } from '@zamp-platform/api';
import { API_ENDPOINTS } from 'apis/apiEndpoint.constants';
import { APITags } from '@/constants/api.constants';
import { baseApi } from '@/services/baseApi';
import type { OpenFeedbackResponseType } from '@/types/api/feedbacks.types';
import type { Skill, SkillStatus } from '@/types/api/skills.types';
import { formRequestUrlWithParams } from '@/utils/common';

const MACS = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get Conversation History
    getConversationHistory: builder.query<
      OpenFeedbackResponseType,
      { resourceType: string; resourceId: string; page?: number; limit?: number; search?: string }
    >({
      query: ({ resourceType, resourceId, page, limit, search }) => ({
        url: API_ENDPOINTS.CONVERSATION_HISTORY_GET,
        params: {
          resource_type: resourceType,
          resource_id: resourceId,
          page,
          limit,
          search: search || undefined,
        },
      }),
      providesTags: [APITags.GET_CONVERSATION_HISTORY],
    }),

    // List Skills
    listSkills: builder.query<
      {
        skills: Skill[];
      },
      { status?: SkillStatus; search?: string }
    >({
      query: (params) => ({
        url: API_ENDPOINTS.SKILLS_LIST_GET,
        params: params ?? undefined,
      }),
      providesTags: [APITags.GET_SKILLS],
    }),

    // Get Skill
    getSkill: builder.query<Skill, { skillId: string }>({
      query: ({ skillId }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.SKILLS_GET_BY_ID, { skillId }),
      }),
    }),

    // Upload Skill
    uploadSkill: builder.mutation<Skill, { file: File }>({
      query: ({ file }) => {
        const formData = new FormData();

        formData.append('file', file);

        return {
          url: API_ENDPOINTS.SKILLS_UPLOAD_POST,
          method: REQUEST_TYPES.POST,
          body: formData,
        };
      },
      invalidatesTags: [APITags.GET_SKILLS],
    }),

    // Update Skill
    updateSkill: builder.mutation<Skill, { skillId: string; file: File }>({
      query: ({ skillId, file }) => {
        const formData = new FormData();

        formData.append('file', file);

        return {
          url: formRequestUrlWithParams(API_ENDPOINTS.SKILLS_UPDATE_PUT, { skillId }),
          method: REQUEST_TYPES.PUT,
          body: formData,
        };
      },
      invalidatesTags: [APITags.GET_SKILLS],
    }),

    // Enable/Disable Skill
    updateSkillStatus: builder.mutation<Skill, { skillId: string; status: SkillStatus }>({
      query: ({ skillId, status }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.SKILLS_STATUS_PATCH, { skillId }),
        method: REQUEST_TYPES.PATCH,
        body: { status },
      }),
      invalidatesTags: [APITags.GET_SKILLS],
      async onQueryStarted({ skillId, status }, { dispatch, queryFulfilled }) {
        // Optimistic update
        const patchResult = dispatch(
          MACS.util.updateQueryData('listSkills', {}, (draft) => {
            const skill = draft.skills.find((s) => s.id === skillId);

            if (skill) {
              skill.status = status;
            }
          }),
        );

        try {
          await queryFulfilled;
        } catch {
          // Rollback on error
          patchResult.undo();
        }
      },
    }),

    // Delete Skill
    deleteSkill: builder.mutation<{ success: boolean }, { skillId: string }>({
      query: ({ skillId }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.SKILLS_DELETE, { skillId }),
        method: REQUEST_TYPES.DELETE,
      }),
      invalidatesTags: [APITags.GET_SKILLS],
      async onQueryStarted({ skillId }, { dispatch, queryFulfilled }) {
        // Optimistic update
        const patchResult = dispatch(
          MACS.util.updateQueryData('listSkills', {}, (draft) => {
            draft.skills = draft.skills.filter((s) => s.id !== skillId);
          }),
        );

        try {
          await queryFulfilled;
        } catch {
          // Rollback on error
          patchResult.undo();
        }
      },
    }),
  }),
});

export const {
  useGetConversationHistoryQuery,
  useListSkillsQuery,
  useLazyListSkillsQuery,
  useGetSkillQuery,
  useLazyGetSkillQuery,
  useUploadSkillMutation,
  useUpdateSkillMutation,
  useUpdateSkillStatusMutation,
  useDeleteSkillMutation,
} = MACS;
