import { FC, useMemo } from 'react';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import ApprovalDetailsBadge from 'modules/payments/payment-details/components/ApprovalDetailsBadge';
import type { AudiencesByOrganisationIdResponse, GetTeamsByOrganizationIdResponseType } from '@/types/api/people.types';
import { PolicyResultStatus, PolicyStepType } from '@/types/api/policies.types';
import { cn } from '@/utils/common';

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
    if (step < currentApprovalStep) {
      return (
        <div className='bg-GREEN_700 f-12-500 flex items-center justify-center h-6 w-6 text-white'>
          <SvgSpriteLoader id='check' size={16} />
        </div>
      );
    }

    if (isCurrentStepPending) {
      return <div className='bg-BLUE_700 f-12-500 flex items-center justify-center h-6 w-6 text-white'>{step + 1}</div>;
    }

    if (step === currentApprovalStep) {
      return (
        <div className='bg-RED_800 f-12-500 flex items-center justify-center h-6 w-6 text-white'>
          <SvgSpriteLoader id='x-close' size={16} />
        </div>
      );
    }

    return <div className='bg-GRAY_1000 f-12-500  flex items-center justify-center h-6 w-6 text-white'>{step + 1}</div>;
  };

  return (
    <div
      className={cn(
        'flex rounded-lg overflow-hidden border w-full',
        isCurrentStepPending ? 'border-BLUE_700' : 'border-GRAY_500',
      )}
    >
      <div className='bg-GRAY_100'>{renderApprovalStatus()}</div>
      <div className='p-5 w-full'>
        {approvalDetails?.conditions?.map((condition, index) => (
          <div key={index}>
            <div className='f-12-500 text-GRAY_700 capitalize mb-1.5'>
              {condition?.mode?.replaceAll('_', ' ').toLowerCase()}
            </div>
            <div className='flex flex-wrap gap-1.5 '>
              {condition?.approver_details?.map((approver, index) => (
                <ApprovalDetailsBadge
                  key={index}
                  approvalDetails={approver}
                  teamsData={teamsData}
                  orgMembers={orgMembers ?? []}
                  orgName={orgName}
                  isApproved={currentApprovalStep > index}
                />
              ))}
            </div>
            {index !== approvalDetails?.conditions.length - 1 && (
              <div className='flex items-center gap-1.5 my-4 f-11-600 text-GRAY_1000'>
                <div>{approvalDetails?.logical_operator}</div>
                <div className='border-dashed border-GRAY_400 border-b w-full ' />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApprovalStatusCard;
