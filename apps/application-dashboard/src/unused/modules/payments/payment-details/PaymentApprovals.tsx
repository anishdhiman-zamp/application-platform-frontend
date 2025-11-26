import type { FC } from 'react';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { useGetAudiencesByOrganisationIdQuery, useGetTeamsByOrganizationIdQuery } from '@/apis/people';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import { useAppSelector } from '@/hooks/toolkit';
import type { RootState } from '@/store';
import type { defaultFnType } from '@/types/commonTypes';
import type { PaymentApprovalsInfoResponseType } from '@/unused/apis/paymentApi.types';
import ApprovalSkeleton from '@/unused/modules/payments/payment-details/components/ApprovalSkeleton';
import ApprovalStatusCard from '@/unused/modules/payments/payment-details/components/ApprovalStatusCard';

type PaymentApprovalsProps = {
  paymentApprovalsInfo?: PaymentApprovalsInfoResponseType;
  isError?: boolean;
  refetch?: defaultFnType;
  isLoading?: boolean;
};

const PaymentApprovals: FC<PaymentApprovalsProps> = ({ paymentApprovalsInfo, isError, refetch, isLoading }) => {
  const { user } = useAppSelector((state: RootState) => state.user);

  const organizationId = user?.orgs?.[0]?.organization_id ?? '';
  const organizationName = `Everyone in ${user?.orgs?.[0]?.name}`;

  const { data: teamsData } = useGetTeamsByOrganizationIdQuery(
    { organizationId },
    { skip: !organizationId, refetchOnMountOrArgChange: false },
  );

  const { data: orgMembers } = useGetAudiencesByOrganisationIdQuery(
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
      isNoData={!paymentApprovalsInfo?.policy_evaluation_data?.approval_flow?.steps?.length}
      noDataBanner={
        <div className='text-GRAY_700 f-12-450 mt-10 flex h-[calc(100%-72px)] items-center justify-center gap-2.5'>
          <SvgSpriteLoader id='lightning-01' width={24} height={24} />
          <div>No approvals found</div>
        </div>
      }
      className='h-[calc(100%-72px)] overflow-auto'
    >
      <div className='bg-BACKGROUND_GRAY_2 text-GRAY_700 h-full w-full overflow-auto py-4'>
        <div className='px-5'>
          <div className='f-11-400 flex items-center gap-1'>
            <SvgSpriteLoader id='info-circle' size={12} />
            Click on approver names to notify approvers of pending approvals
          </div>
          <div className='f-11-400 flex items-center gap-1 pt-4 pb-2.5'>
            <SvgSpriteLoader id='arrow-down' size={12} />
            Approval steps
          </div>
        </div>
        <div className='flex flex-col gap-3 px-4'>
          {paymentApprovalsInfo?.policy_evaluation_data?.approval_flow?.steps.map((step: any, index: any) => (
            <ApprovalStatusCard
              key={index}
              step={index}
              approvalDetails={step}
              teamsData={teamsData ?? []}
              orgMembers={orgMembers ?? []}
              orgName={organizationName}
              currentApprovalStep={paymentApprovalsInfo?.policy_evaluation_data?.current_approval_step}
              status={paymentApprovalsInfo?.status}
            />
          ))}
        </div>
      </div>
    </CommonWrapper>
  );
};

export default PaymentApprovals;
