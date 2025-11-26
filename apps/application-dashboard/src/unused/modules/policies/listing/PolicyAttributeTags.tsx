import { FC } from 'react';
import { Tag } from '@zamp-platform/ui';
import { attributesMap } from '@/unused/modules/policies/create/constants';
import { CreatePolicyCondition } from '@/unused/modules/policies/types';

interface PolicyAttributeTagsProps {
  creatorLength?: number;
  conditions?: CreatePolicyCondition[];
  action: string;
}

const hasOptions = (attr: any): attr is { options: Array<{ value: string; label: string }> } => {
  return 'options' in attr && Array.isArray(attr.options);
};

const PolicyAttributeTags: FC<PolicyAttributeTagsProps> = ({ creatorLength, conditions, action }) => (
  <div className='flex flex-wrap gap-1.5'>
    <Tag variant='gray'>
      {creatorLength ?? 'Any'} {creatorLength && creatorLength > 1 ? 'Creators' : 'Creator'}
    </Tag>
    {conditions?.map((condition) => (
      <Tag variant='gray' key={condition.field}>
        {condition.display_name}
      </Tag>
    ))}
    <Tag variant='gray'>
      {hasOptions(attributesMap.action)
        ? attributesMap.action.options.find((option) => option.value === action)?.label
        : action}
    </Tag>
  </div>
);

export default PolicyAttributeTags;
