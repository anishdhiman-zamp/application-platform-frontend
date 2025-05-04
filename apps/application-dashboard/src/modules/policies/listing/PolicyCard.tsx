import { FC } from 'react';
import { ListCard } from '@zamp-platform/ui';
import { format } from 'date-fns';
import PolicyActionsDropdown from 'modules/policies/listing/PolicyActionsDropdown';
import PolicyAttributeTags from 'modules/policies/listing/PolicyAttributeTags';
import { DATE_FORMATS } from '@/constants/date.constants';
import { AudiencesByResourceResponse } from '@/types/api/collaboration.types';
import { PolicyDetailsType } from '@/types/api/paymentApi.types';

type PolicyCardProps = {
  policy: PolicyDetailsType;
  audienceMembersData: AudiencesByResourceResponse[];
};

const PolicyCard: FC<PolicyCardProps> = ({ policy, audienceMembersData }) => {
  const teamMember = audienceMembersData?.find((member) => member.user?.user_id === policy.created_by);

  return (
    <>
      <ListCard
        header={
          <div className='flex items-center gap-2'>
            <span className='f-11-400 text-gray-700'>
              Created on {format(new Date(policy.created_at), DATE_FORMATS.ddMMMyyyy)} by {teamMember?.user?.name}
            </span>
            {policy.status && (
              <>
                <span className='w-1 h-1 bg-orange-800 rounded-full' />
                <span className='f-11-450 text-orange-800'>{policy.status}</span>
              </>
            )}
          </div>
        }
        rightComponent={<PolicyActionsDropdown policy={policy} />}
      >
        <div className='space-y-2'>
          <h2 className='f-13-550'>{policy.name}</h2>
          <PolicyAttributeTags
            creatorLength={policy.policy_configurations.creator?.length}
            conditions={policy.policy_configurations.conditions.conditions}
            action={policy.policy_configurations.action}
          />
        </div>
      </ListCard>
    </>
  );
};

export default PolicyCard;
