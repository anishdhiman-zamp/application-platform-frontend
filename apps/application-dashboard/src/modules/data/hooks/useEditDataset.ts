import { useMemo } from 'react';
import { useCheckDatasetCreationEnabled } from '@zamp-platform/dataset-create-edit';
import { useParams } from 'next/navigation';
import { useResourceAccess } from '@/hooks/useResourceAccess';
import { DATASET_ACCESS_PRIVILEGES } from '@/modules/shareResource/shareResource.types';
import { ResourceType } from '@/types/api/policies.types';

/**
 * Hook to check if the current user can edit the dataset
 * Returns true when:
 * - Dataset is in creation mode (source=creation in URL), OR
 * - User has admin privilege, OR
 * - User has data editor privilege
 *
 * Skips audience API call when in creation mode (no need to check permissions)
 *
 * @param overrideDatasetId - Optional dataset ID to use instead of URL params
 */
export const useEditDataset = (overrideDatasetId?: string): boolean => {
  const params = useParams<{ datasetId: string }>();
  const datasetId = overrideDatasetId || params?.datasetId || '';

  const isDatasetCreationEnabled = useCheckDatasetCreationEnabled();

  // Skip audience/teams API calls when in creation mode — no need to check permissions
  const { checkUserPrivilege } = useResourceAccess({
    resourceType: ResourceType.DATASET,
    resourceId: datasetId,
    skipAudienceData: isDatasetCreationEnabled,
    skipTeamsData: isDatasetCreationEnabled,
  });

  const canEdit = useMemo(() => {
    if (isDatasetCreationEnabled) return true;

    return (
      checkUserPrivilege(DATASET_ACCESS_PRIVILEGES.ADMIN) || checkUserPrivilege(DATASET_ACCESS_PRIVILEGES.DATA_EDITOR)
    );
  }, [isDatasetCreationEnabled, checkUserPrivilege]);

  return canEdit;
};
