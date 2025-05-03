import { FC, useState } from 'react';
import { ListCard } from '@zamp-platform/ui';
import { format } from 'date-fns';
import PolicyAttributeTags from 'modules/policies/listing/PolicyAttributeTags';
import SvgSpriteLoader from '@/components/SvgSpriteLoader';
import { DATE_FORMATS } from '@/constants/date.constants';
import PolicyDeleteConfirmPopup from '@/modules/policies/listing/PolicyDeleteConfirmPopup';
import { AudiencesByResourceResponse } from '@/types/api/collaboration.types';
import { PolicyDetailsType } from '@/types/api/paymentApi.types';

type PolicyCardProps = {
  policy: PolicyDetailsType;
  audienceMembersData: AudiencesByResourceResponse[];
};

const PolicyCard: FC<PolicyCardProps> = ({ policy, audienceMembersData }) => {
  const [isDeleteConfirmPopupOpen, setIsDeleteConfirmPopupOpen] = useState(false);
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
                <span className='f-11-450 text-orange-800'>Approval pending</span>
              </>
            )}
          </div>
        }
        dropdownOptions={[
          <div
            className='flex gap-1.5 text-red-800 flex-1 f-12-500 items-center'
            onClick={() => setIsDeleteConfirmPopupOpen(true)}
            key='delete-policy'
          >
            <SvgSpriteLoader id='trash-03' size={12} />
            <span>Delete</span>
          </div>,
        ]}
      >
        <div className='space-y-2'>
          <h2 className='f-13-550'>{policy.name}</h2>
          <PolicyAttributeTags
            creatorLength={policy.policy_configurations.creator?.length}
            conditions={policy.policy_configurations.conditions.conditions}
          />
        </div>
      </ListCard>
      <PolicyDeleteConfirmPopup
        isOpen={isDeleteConfirmPopupOpen}
        onClose={() => setIsDeleteConfirmPopupOpen(false)}
        policy={policy}
      />
    </>
  );
};

export default PolicyCard;
