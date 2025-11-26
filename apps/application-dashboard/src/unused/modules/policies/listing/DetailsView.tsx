import { FC } from 'react';
import { Button, StepCard } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import AudienceMember from '@/components/audience-member';
import { AudiencesByResourceResponse } from '@/types/api/collaboration.types';
import { PolicyDetailsType } from '@/unused/apis/paymentApi.types';
import { POLICY_APPROVAL_STEP_MODIFIERS } from '@/unused/modules/policies/constants';
import PolicyActionsDropdown from '@/unused/modules/policies/listing/PolicyActionsDropdown';
import PolicyAttributeTags from '@/unused/modules/policies/listing/PolicyAttributeTags';

interface DetailsViewProps {
  policy: PolicyDetailsType;
  audienceMembersData?: Array<AudiencesByResourceResponse & { team_name: string; team_color: string }>;
  onBack: () => void;
}

const DetailsView: FC<DetailsViewProps> = ({ policy, audienceMembersData, onBack }) => {
  return (
    <>
      <div className='mb-4.5 flex items-center justify-between'>
        <div className='flex w-full items-center gap-2'>
          <Button variant='ghost' size='small' onClick={onBack} className='min-w-0 p-0'>
            <SvgSpriteLoader id='arrow-left' size={18} />
          </Button>
          <h1 className='f-16-600'>{policy.name}</h1>
          <div className='ml-auto'>
            <PolicyActionsDropdown policy={policy} />
          </div>
        </div>
      </div>
      <div className='h-[calc(100vh-92px)] overflow-y-auto pb-6 [&::-webkit-scrollbar]:hidden'>
        <div className='space-y-4'>
          <PolicyAttributeTags
            creatorLength={policy?.policy_configurations?.creator?.length}
            conditions={policy?.policy_configurations?.conditions?.conditions}
            action={policy?.policy_configurations?.action}
          />
          {/* Approval Flow Section */}
          <div className='space-y-4'>
            {policy?.policy_configurations?.approval_flow?.steps?.map((step, idx) => (
              <StepCard key={idx} stepNumber={idx + 1} className='p-0'>
                <div className='space-y-4'>
                  {step.conditions.map((cond, cidx) => (
                    <div key={cidx} className='mb-2'>
                      {cidx > 0 && (
                        <div className='mb-2 flex items-center gap-1.5'>
                          <span className='f-11-600'>OR</span>
                          <div className='border-GRAY_400 h-0 w-full border-t border-dashed' />
                        </div>
                      )}
                      <div className='mb-2 flex items-center gap-2'>
                        <span className='f-12-500 text-gray-700'>
                          {POLICY_APPROVAL_STEP_MODIFIERS.find((modifier) => modifier?.value === cond.mode)?.label}
                        </span>
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
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default DetailsView;
