import type { FC } from 'react';
import ApproveActionCard from 'modules/payments/payment-details/components/ApproveActionCard';
import PaymentApprovals from 'modules/payments/payment-details/PaymentApprovals';
import TemplateCard from 'modules/payments/templates/components/TemplateCard';
import { useGetPaymentApprovalsInfoQuery } from '@/apis/payments';
import SvgSpriteLoader from '@/components/SvgSpriteLoader';
import type { TemplateDetailsType } from '@/types/api/paymentApi.types';
import type { defaultFnType } from '@/types/commonTypes';

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
  } = useGetPaymentApprovalsInfoQuery(template?.policy_result_id || '');

  return (
    <div className='py-6 h-full flex flex-col '>
      <div className='flex items-center px-4.5 pb-2.5 border-b border-GRAY_400'>
        <SvgSpriteLoader id='arrow-left' size={14} onClick={onBackClick} />
        <TemplateCard template={template} />
      </div>
      {template?.can_approve && <ApproveActionCard approvalId={template?.id} />}

      <div className='px-4 py-4 bg-BG_GRAY_2 flex-1 overflow-y-auto'>
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
