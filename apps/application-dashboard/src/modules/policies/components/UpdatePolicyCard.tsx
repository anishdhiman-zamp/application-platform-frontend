import type { FC } from 'react';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import PolicyStepDetails from 'modules/policies/components/PolicyStepDetails';
import PolicyAttributeTags from 'modules/policies/listing/PolicyAttributeTags';
import type { CreatePolicyConfigPayload } from 'modules/policies/types';
import type { AudiencesByResourceResponse } from '@/types/api/collaboration.types';
type UpdatePolicyCardProps = {
  policyConfig: CreatePolicyConfigPayload;
  audienceMembersData?: Array<AudiencesByResourceResponse & { team_name: string; team_color: string }>;
  label: string;
};

const UpdatePolicyCard: FC<UpdatePolicyCardProps> = ({ policyConfig, audienceMembersData, label }) => {
  return (
    <div className='px-6 py-3'>
      <div className='f-13-450 text-GRAY_700 mb-2.5'>{label}</div>
      <div className='rounded-lg border border-GRAY_400 overflow-hidden'>
        <div className='bg-white border-b border-GRAY_400 px-4.5 py-6'>
          <PolicyAttributeTags
            creatorLength={policyConfig?.creator?.length}
            conditions={policyConfig?.conditions?.conditions}
            action={policyConfig?.action}
          />
        </div>
        <div className='bg-BG_GRAY_2 pb-20'>
          <div className='flex items-center gap-1 px-5 pt-4 pb-2.5 text-GRAY_700 f-11-400'>
            <SvgSpriteLoader id='arrow-down' size={12} />
            Approval steps
          </div>
          <div className='px-4 flex flex-col gap-3 max-h-[400px] overflow-y-auto'>
            {policyConfig?.approval_flow?.steps.map((step, idx) => (
              <PolicyStepDetails
                key={idx}
                step={step}
                audienceMembersData={audienceMembersData}
                stepNumber={idx + 1}
                operator={policyConfig?.conditions?.logical_operator}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdatePolicyCard;
