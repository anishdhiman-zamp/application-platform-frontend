import { FC, useEffect, useState } from 'react';
import { FEATURE_FLAGS } from '@/constants/featureFlags';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { datasetConfig, ResourceType, ShareResourcePopup } from '@/modules/shareResource';
import { PERMISSION_ROLES } from '@/utils/accessPermission/accessPermission.types';

/**
 * ShareDatasetPopup component
 * Wrapper around the shared ShareResourcePopup component with dataset-specific configuration
 */

type ShareDatasetPopupProps = {
  datasetId: string;
  disable?: boolean;
};

const ShareDatasetPopup: FC<ShareDatasetPopupProps> = ({ datasetId, disable }) => {
  const [isCustomiseAccess, setIsCustomiseAccess] = useState<boolean>(false);
  const { evaluate, ldClient } = useFeatureFlags();

  useEffect(() => {
    if (ldClient) {
      evaluate(FEATURE_FLAGS.FGAC)
        .then((res) => {
          setIsCustomiseAccess(res);
        })
        .catch(() => {
          setIsCustomiseAccess(false);
        });
    }
  }, [evaluate, ldClient]);

  return (
    <ShareResourcePopup
      resourceId={datasetId}
      resourceType={ResourceType.DATASET}
      resourceConfig={datasetConfig}
      resourceAdminPrivilege={PERMISSION_ROLES.ADMIN}
      isCustomiseAccess={isCustomiseAccess}
      disable={disable}
    />
  );
};

export default ShareDatasetPopup;
