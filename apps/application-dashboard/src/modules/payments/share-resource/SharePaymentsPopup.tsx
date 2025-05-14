import { FC, useEffect, useState } from 'react';
import { FEATURE_FLAGS } from '@/constants/featureFlags';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { PAYMENT_ACCESS_PRIVILEGES, paymentsConfig, ResourceType, ShareResourcePopup } from '@/modules/shareResource';

/**
 * SharePagePopup component
 * Wrapper around the shared ShareResourcePopup component with page-specific configuration
 */

type SharePaymentsPopupProps = {
  paymentConfigId: string;
};

const SharePaymentsPopup: FC<SharePaymentsPopupProps> = ({ paymentConfigId }) => {
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
      resourceId={paymentConfigId}
      resourceType={ResourceType.PAYMENTS}
      resourceConfig={paymentsConfig}
      resourceAdminPrivilege={PAYMENT_ACCESS_PRIVILEGES.ADMIN}
      isCustomiseAccess={isCustomiseAccess}
    />
  );
};

export default SharePaymentsPopup;
