import type { FC } from 'react';
import ApprovalSkeleton from 'modules/payments/payment-details/components/ApprovalSkeleton';
import ApprovalStatusCard from 'modules/payments/payment-details/components/ApprovalStatusCard';
import { useGetTeamsByOrganizationIdQuery } from '@/apis/people';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import SvgSpriteLoader from '@/components/SvgSpriteLoader';
import { useAppSelector } from '@/hooks/toolkit';
import type { RootState } from '@/store';
import type { PaymentApprovalsInfoResponseType } from '@/types/api/paymentApi.types';
import type { defaultFnType } from '@/types/commonTypes';

type PaymentApprovalsProps = {
  paymentApprovalsInfo?: PaymentApprovalsInfoResponseType;
  isError?: boolean;
  refetch?: defaultFnType;
  isLoading?: boolean;
};

const PaymentApprovals: FC<PaymentApprovalsProps> = ({ paymentApprovalsInfo, isError, refetch, isLoading }) => {
  const { user } = useAppSelector((state: RootState) => state.user);

  const organizationId = user?.orgs?.[0]?.organization_id ?? '';

  const { data: teamsData } = useGetTeamsByOrganizationIdQuery(
    { organizationId },
    { skip: !organizationId, refetchOnMountOrArgChange: false },
  );

  return (
    <CommonWrapper
      isLoading={isLoading}
      isError={isError}
      refetchFunction={refetch}
      skeletonType={SkeletonTypes.CUSTOM}
      loader={<ApprovalSkeleton />}
    >
      <div className='w-full h-full overflow-auto bg-BACKGROUND_GRAY_2 py-4 text-GRAY_700'>
        <div className='px-5'>
          <div className='flex items-center gap-1 f-11-400'>
            <SvgSpriteLoader id='info-circle' size={12} />
            Click on approver names to notify approvers of pending approvals
          </div>
          <div className='flex items-center gap-1 pb-2.5 pt-4 f-11-400'>
            <SvgSpriteLoader id='arrow-down' size={12} />
            Approval steps
          </div>
        </div>
        <div className='px-4 flex flex-col gap-3'>
          {paymentApprovalsInfo?.policy_evaluation_data?.approval_flow?.steps.map((step: any, index: any) => (
            <ApprovalStatusCard key={index} step={index} approvalDetails={step} teamsData={teamsData ?? []} />
          ))}
        </div>
      </div>
    </CommonWrapper>
  );
};

export default PaymentApprovals;
