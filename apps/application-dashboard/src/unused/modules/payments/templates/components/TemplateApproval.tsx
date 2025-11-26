import type { FC } from 'react';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import type { defaultFnType } from '@/types/commonTypes';
import type { TemplateDetailsType } from '@/unused/apis/paymentApi.types';
import { useGetTemplateApprovalsInfoQuery } from '@/unused/apis/payments';
import ApproveActionCard from '@/unused/modules/payments/payment-details/components/ApproveActionCard';
import PaymentApprovals from '@/unused/modules/payments/payment-details/PaymentApprovals';
import TemplateCard from '@/unused/modules/payments/templates/components/TemplateCard';

type TemplateApprovalProps = {
  template: TemplateDetailsType;
  onBackClick: defaultFnType;
};

const TemplateApproval: FC<TemplateApprovalProps> = ({ template, onBackClick }) => {
  const {
    data: paymentApprovalsInfo,
    isLoading: isPaymentApprovalsInfoLoading,
    isError,
    refetch,
  } = useGetTemplateApprovalsInfoQuery(template?.id || '');

  return (
    <div className='flex h-full flex-col pt-6'>
      <div className='border-GRAY_400 flex items-center border-b px-4.5 pb-2.5'>
        <SvgSpriteLoader id='arrow-left' size={14} onClick={onBackClick} />
        <TemplateCard template={template} />
      </div>
      {paymentApprovalsInfo?.approval_id && <ApproveActionCard approvalId={paymentApprovalsInfo?.approval_id} />}

      <div className='bg-BG_GRAY_2 flex-1 overflow-y-auto px-4 py-4'>
        <PaymentApprovals
          paymentApprovalsInfo={paymentApprovalsInfo}
          isLoading={isPaymentApprovalsInfoLoading}
          isError={isError}
          refetch={refetch}
        />
      </div>
    </div>
  );
};

export default TemplateApproval;
