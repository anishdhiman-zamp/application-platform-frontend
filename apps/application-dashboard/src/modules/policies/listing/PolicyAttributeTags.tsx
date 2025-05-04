import { FC } from 'react';
import { Tag } from '@zamp-platform/ui';
import { attributesMap } from 'modules/policies/create/constants';
import { snakeCaseToSentenceCase } from '@/utils/common';

interface PolicyAttributeTagsProps {
  creatorLength?: number;
  conditions: { field: string; value: any; operator: string }[];
  action: string;
}

const hasOptions = (attr: any): attr is { options: Array<{ value: string; label: string }> } => {
  return 'options' in attr && Array.isArray(attr.options);
};

const PolicyAttributeTags: FC<PolicyAttributeTagsProps> = ({ creatorLength, conditions, action }) => (
  <div className='flex gap-1.5 flex-wrap'>
    <Tag variant='gray'>{creatorLength ?? 'Any'} Creator</Tag>
    {conditions.map((condition) => (
      <Tag variant='gray' key={condition.field}>
        {Array.isArray(condition.value)
          ? `${condition.value.length} ${snakeCaseToSentenceCase(condition.field)}`
          : `${snakeCaseToSentenceCase(condition.field)} ${condition.operator} ${condition.value}`}
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
