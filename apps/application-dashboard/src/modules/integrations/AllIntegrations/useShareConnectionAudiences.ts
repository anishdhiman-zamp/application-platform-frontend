'use client';

import { useCallback } from 'react';
import { toast } from '@zamp-platform/ui';
import { API_ENDPOINTS } from '@/apis/apiEndpoint.constants';
import { usePostShareResourceToAudiencesMutation } from '@/apis/collaboration';
import type { ConnectIntegrationDialogAudience } from '@/modules/integrations/types/integrations.types';
import { resourceTypeRouteMap } from '@/modules/shareResource/shareResource.constants';
import { ResourceType } from '@/modules/shareResource/shareResource.types';

/**
 * Posts the given audiences to a connection's share endpoint immediately after
 * authentication succeeds. Surfaces a "Connected, but failed to share" toast on
 * failure so the connection itself is preserved even if the share call errors.
 */
export const useShareConnectionAudiences = () => {
  const [shareResource] = usePostShareResourceToAudiencesMutation();

  const shareWithAudiences = useCallback(
    (connectionId: string, audiences: ConnectIntegrationDialogAudience[]) =>
      shareResource({
        apiEndpoint: API_ENDPOINTS.RESOURCE_AUDIENCES_BY_RESOURCE_ID_GET_V2,
        resourceRoute: resourceTypeRouteMap[ResourceType.CONNECTION],
        resourceId: connectionId,
        body: {
          audiences: audiences.map((a) => ({ ...a, fgac_filters: null })),
        },
      })
        .unwrap()
        .then(() => undefined)
        .catch(() => {
          toast.error('Connected, but failed to share with selected audiences');
        }),
    [shareResource],
  );

  return shareWithAudiences;
};
