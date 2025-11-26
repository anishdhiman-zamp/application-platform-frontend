import type { FC } from 'react';
import { StepCard } from '@zamp-platform/ui';
import AudienceMember from '@/components/audience-member';
import type { AudiencesByResourceResponse } from '@/types/api/collaboration.types';
import type { PolicyApprovalStep } from '@/unused/modules/policies/types';
import { snakeCaseToSentenceCase } from '@/utils/common';

type PolicyStepDetailsProps = {
  step: PolicyApprovalStep;
  audienceMembersData?: Array<AudiencesByResourceResponse & { team_name: string; team_color: string }>;
  stepNumber: number;
  operator?: string;
};

const PolicyStepDetails: FC<PolicyStepDetailsProps> = ({ step, audienceMembersData, stepNumber, operator }) => {
  return (
    <StepCard stepNumber={stepNumber} className='p-0'>
      <div className='space-y-4'>
        {step?.conditions.map((cond, cidx) => (
          <div key={cidx} className='mb-2'>
            {cidx > 0 && (
              <div className='mb-2 flex items-center gap-1.5'>
                <span className='f-11-600'>{operator?.toUpperCase()}</span>
                <div className='border-GRAY_400 h-0 w-full border-t border-dashed' />
              </div>
            )}
            <div className='mb-2 flex items-center gap-2'>
              <span className='f-12-500 text-gray-700'> {snakeCaseToSentenceCase(cond?.mode.toLowerCase() ?? '')}</span>
              {cond?.approver_details.map((approver, idx) => {
                const audienceMember = audienceMembersData?.find(
                  (member) => member?.resource_audience_id === approver?.id,
                );

                if (!audienceMember) return null;

                return (
                  <AudienceMember
                    key={idx}
                    teamInfo={{
                      name: audienceMember?.team_name,
                      color: audienceMember?.team_color,
                    }}
                    currentUserHasAdminAccess={false}
                    resourceAudienceType={audienceMember?.resource_audience_type}
                    resourceType={audienceMember?.resource_type}
                    user={audienceMember?.user}
                    showAvatar={false}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </StepCard>
  );
};

export default PolicyStepDetails;
