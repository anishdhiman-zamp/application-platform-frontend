import { FC, useMemo } from 'react';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import type { AudiencesByOrganisationIdResponse, GetTeamsByOrganizationIdResponseType } from '@/types/api/people.types';
import { PolicyResultStatus, PolicyStepType } from '@/unused/apis/policies.types';
import ApprovalDetailsBadge from '@/unused/modules/payments/payment-details/components/ApprovalDetailsBadge';
import { cn, snakeCaseToSentenceCase } from '@/utils/common';

type ApprovalStatusCardProps = {
  step: number;
  approvalDetails: PolicyStepType;
  teamsData: GetTeamsByOrganizationIdResponseType[];
  orgMembers: AudiencesByOrganisationIdResponse[];
  orgName: string;
  currentApprovalStep: number;
  status: PolicyResultStatus;
};

const ApprovalStatusCard: FC<ApprovalStatusCardProps> = ({
  step,
  approvalDetails,
  teamsData,
  orgMembers,
  orgName,
  currentApprovalStep,
  status,
}) => {
  const isCurrentStepPending = useMemo(() => {
    return step === currentApprovalStep && status === PolicyResultStatus.PENDING_APPROVAL;
  }, [step, currentApprovalStep, status]);

  const renderApprovalStatus = () => {
    if (step < currentApprovalStep || status === PolicyResultStatus.APPROVED) {
      return (
        <div className='bg-GREEN_700 f-12-500 flex h-6 w-6 items-center justify-center text-white'>
          <SvgSpriteLoader id='check' size={16} />
        </div>
      );
    }

    if (isCurrentStepPending) {
      return <div className='bg-BLUE_700 f-12-500 flex h-6 w-6 items-center justify-center text-white'>{step + 1}</div>;
    }

    if (step === currentApprovalStep) {
      return (
        <div className='bg-RED_800 f-12-500 flex h-6 w-6 items-center justify-center text-white'>
          <SvgSpriteLoader id='x-close' size={16} />
        </div>
      );
    }

    return <div className='bg-GRAY_1000 f-12-500 flex h-6 w-6 items-center justify-center text-white'>{step + 1}</div>;
  };

  return (
    <div
      className={cn(
        'flex w-full overflow-hidden rounded-lg border',
        isCurrentStepPending ? 'border-BLUE_700' : 'border-GRAY_500',
      )}
    >
      <div className='bg-GRAY_100'>{renderApprovalStatus()}</div>
      <div className='w-full p-5'>
        {approvalDetails?.conditions?.map((condition, index) => (
          <div key={index}>
            <div className='f-12-500 text-GRAY_700 mb-1.5'>
              {snakeCaseToSentenceCase(condition?.mode.toLowerCase() ?? '')}
            </div>
            <div className='flex flex-wrap gap-1.5'>
              {condition?.approver_details?.map((approver, userIndex) => (
                <ApprovalDetailsBadge
                  key={userIndex}
                  approvalDetails={approver}
                  teamsData={teamsData}
                  orgMembers={orgMembers ?? []}
                  orgName={orgName}
                  isApproved={currentApprovalStep > step}
                />
              ))}
            </div>
            {index !== approvalDetails?.conditions.length - 1 && (
              <div className='f-11-600 text-GRAY_1000 my-4 flex items-center gap-1.5'>
                <div>{approvalDetails?.logical_operator}</div>
                <div className='border-GRAY_400 w-full border-b border-dashed' />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApprovalStatusCard;
