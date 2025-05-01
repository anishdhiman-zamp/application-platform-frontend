import { FC, useState } from 'react';
import { ListCard, Tag } from '@zamp-platform/ui';
import { format } from 'date-fns';
import PolicyDeleteConfirmPopup from 'modules/payments/components/PolicyDeleteConfirmPopup';
import SvgSpriteLoader from '@/components/SvgSpriteLoader';
import { DATE_FORMATS } from '@/constants/date.constants';
import { PolicyDetailsType } from '@/types/api/paymentApi.types';

type PolicyCardProps = {
  policy: PolicyDetailsType;
};

const PolicyCard: FC<PolicyCardProps> = ({ policy }) => {
  const [isDeleteConfirmPopupOpen, setIsDeleteConfirmPopupOpen] = useState(false);

  return (
    <>
      <ListCard
        header={
          <div className='flex items-center gap-2'>
            <span className='f-11-400 text-gray-700'>
              Created on {format(new Date(policy.created_at), DATE_FORMATS.ddMMMyyyy)} by {policy.created_by}
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
          <div className='flex gap-1.5 flex-wrap'>
            <Tag variant='gray'>{policy.policy_configurations.creator?.length ?? 'Any'} Creator</Tag>
            {policy.policy_configurations.conditions.conditions.map((condition) => (
              <Tag variant='gray' key={condition.field}>
                {Array.isArray(condition.value)
                  ? `${condition.value.length} ${condition.field} `
                  : `${condition.field} ${condition.operator} ${condition.value}`}
              </Tag>
            ))}
          </div>
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
