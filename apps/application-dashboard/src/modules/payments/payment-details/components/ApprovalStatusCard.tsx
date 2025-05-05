import { FC } from 'react';
import ApprovalDetailsBadge from 'modules/payments/payment-details/components/ApprovalDetailsBadge';
import type { AudiencesByOrganisationIdResponse, GetTeamsByOrganizationIdResponseType } from '@/types/api/people.types';
import type { PolicyStepType } from '@/types/api/policies.types';

type ApprovalStatusCardProps = {
  step: number;
  approvalDetails: PolicyStepType;
  teamsData: GetTeamsByOrganizationIdResponseType[];
  orgMembers: AudiencesByOrganisationIdResponse[];
  orgName: string;
};

const ApprovalStatusCard: FC<ApprovalStatusCardProps> = ({ step, approvalDetails, teamsData, orgMembers, orgName }) => {
  return (
    <div className='flex rounded-lg overflow-hidden border border-GRAY_500 w-full'>
      <div className='bg-GRAY_100'>
        <div className='bg-GRAY_1000 f-12-500  flex items-center justify-center h-6 w-6 text-white'>{step + 1}</div>
      </div>
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
