import { FC } from 'react';
import { Button, StepCard } from '@zamp-platform/ui';
import PolicyActionsDropdown from 'modules/policies/listing/PolicyActionsDropdown';
import PolicyAttributeTags from 'modules/policies/listing/PolicyAttributeTags';
import AudienceMember from '@/components/audience-member';
import SvgSpriteLoader from '@/components/SvgSpriteLoader';
import { AudiencesByResourceResponse } from '@/types/api/collaboration.types';
import { PolicyDetailsType } from '@/types/api/paymentApi.types';

interface DetailsViewProps {
  policy: PolicyDetailsType;
  audienceMembersData?: Array<AudiencesByResourceResponse & { team_name: string; team_color: string }>;
  onBack: () => void;
}

const DetailsView: FC<DetailsViewProps> = ({ policy, audienceMembersData, onBack }) => {
  return (
    <>
      <div className='flex items-center justify-between mb-4.5'>
        <div className='flex items-center gap-2 w-full'>
          <Button variant='ghost' size='small' onClick={onBack} className='p-0 min-w-0'>
            <SvgSpriteLoader id='arrow-left' size={18} />
          </Button>
          <h1 className='f-16-600'>{policy.name}</h1>
          <div className='ml-auto'>
            <PolicyActionsDropdown policy={policy} audienceMembersData={audienceMembersData} />
          </div>
        </div>
      </div>
      <div className='overflow-y-auto h-[calc(100vh-92px)] pb-6 [&::-webkit-scrollbar]:hidden'>
        <div className='space-y-4'>
          <PolicyAttributeTags
            creatorLength={policy.policy_configurations.creator?.length}
            conditions={policy.policy_configurations.conditions.conditions}
            action={policy.policy_configurations.action}
          />
          {/* Approval Flow Section */}
          <div className='space-y-4'>
            {policy.policy_configurations.approval_flow?.steps.map((step, idx) => (
              <StepCard key={idx} stepNumber={idx + 1} className='p-0'>
                <div className='space-y-4'>
                  {step.conditions.map((cond, cidx) => (
                    <div key={cidx} className='mb-2'>
                      {cidx > 0 && (
                        <div className='flex items-center gap-1.5 mb-2'>
                          <span className='f-11-600'>OR</span>
                          <div className='h-0 border-t border-GRAY_400 w-full border-dashed' />
                        </div>
                      )}
                      <div className='flex items-center gap-2 mb-2'>
                        <span className='f-12-500 text-gray-700'>Any of</span>
                        {cond.approver_details.map((approver, idx) => {
                          const audienceMember = audienceMembersData?.find(
                            (member) => member.resource_audience_id === approver.id,
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
