import { FC } from 'react';
import { PAYMENT_ACCESS_PRIVILEGES, paymentsConfig, ResourceType, ShareResourcePopup } from '@/modules/shareResource';

/**
 * SharePagePopup component
 * Wrapper around the shared ShareResourcePopup component with page-specific configuration
 */

type SharePaymentsPopupProps = {
  paymentConfigId: string;
};

const SharePaymentsPopup: FC<SharePaymentsPopupProps> = ({ paymentConfigId }) => {
  return (
    <ShareResourcePopup
      resourceId={paymentConfigId}
      resourceType={ResourceType.PAYMENTS}
      resourceConfig={paymentsConfig}
      resourceAdminPrivilege={PAYMENT_ACCESS_PRIVILEGES.ADMIN}
    />
  );
};

export default SharePaymentsPopup;
