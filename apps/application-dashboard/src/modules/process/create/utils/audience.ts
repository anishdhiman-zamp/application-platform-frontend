import { getFromLocalStorage, LOCAL_STORAGE_KEYS } from '@zamp-platform/utils';
import { collaborationEndpoints } from '@/apis/collaboration';
import { ArrayListOption } from '@/components/multiSelectInput/multiSelectInput.types';
import { APITags } from '@/constants/api.constants';
import { resourceTypeRouteMap } from '@/modules/shareResource/shareResource.constants';
import { PROCESS_ACCESS_PRIVILEGES, ResourceType } from '@/modules/shareResource/shareResource.types';
import { baseApi } from '@/services/baseApi';
import { store } from '@/store';
import { ResourceAudienceType } from '@/types/api/auth.types';
import { AddAudiencesToResourcePayload } from '@/types/api/collaboration.types';

const processAudiencesStorage = new Map<string, ArrayListOption[]>();

export const storeProcessAudiences = (processId: string, audiences: ArrayListOption[]) => {
  processAudiencesStorage.set(processId, audiences);
};

export const getAndRemoveProcessAudiences = (processId: string): ArrayListOption[] | undefined => {
  const audiences = processAudiencesStorage.get(processId);

  processAudiencesStorage.delete(processId);

  return audiences;
};

export const shareProcessWithAudiences = async (processId: string, audiences: ArrayListOption[]): Promise<void> => {
  if (!audiences || audiences.length === 0) {
    return;
  }

  // Get organizationId from store for organization type audiences
  const state = store.getState();
  const organizationId =
    state?.user?.user?.orgs?.[0]?.organization_id ||
    getFromLocalStorage(LOCAL_STORAGE_KEYS.XZAMP_ORGANIZATION_ID) ||
    '';

  // Transform audiences to API format
  const shareData: AddAudiencesToResourcePayload = {
    audiences: audiences.map((item) => {
      // For organization type, use organizationId as audience_id
      // For other types, use resource_audience_id, team_id, or value (email)
      let audienceId = item.resource_audience_id || item.team_id || item.value;

      if (item.resource_audience_type === ResourceAudienceType.ORGANIZATION) {
        audienceId = organizationId;
      }

      return {
        audience_type: item.resource_audience_type || '',
        audience_id: audienceId,
        role: PROCESS_ACCESS_PRIVILEGES.EDITOR || '',
        fgac_filters: null, // No filters for initial sharing
      };
    }),
  };

  const resourceRoute = resourceTypeRouteMap[ResourceType.PROCESS];

  try {
    await store
      .dispatch(
        collaborationEndpoints.postShareResourceToAudiences.initiate({
          resourceRoute,
          resourceId: processId,
          body: shareData,
        }),
      )
      .unwrap();

    // Invalidate the audiences cache for this specific process to trigger refetch
    store.dispatch(
      baseApi.util.invalidateTags([{ type: APITags.GET_AUDIENCE_BY_RESOURCE_ID, id: `${resourceRoute}-${processId}` }]),
    );
  } catch (error: unknown) {
    console.error('[Process] Failed to share with audiences:', error);
    // Don't throw - process creation succeeded, sharing is secondary
  }
};
