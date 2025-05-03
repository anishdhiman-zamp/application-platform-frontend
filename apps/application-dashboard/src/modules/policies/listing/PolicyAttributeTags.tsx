import { FC } from 'react';
import { Tag } from '@zamp-platform/ui';
import { snakeCaseToSentenceCase } from '@/utils/common';

interface PolicyAttributeTagsProps {
  creatorLength?: number;
  conditions: { field: string; value: any; operator: string }[];
}

const PolicyAttributeTags: FC<PolicyAttributeTagsProps> = ({ creatorLength, conditions }) => (
  <div className='flex gap-1.5 flex-wrap'>
    <Tag variant='gray'>{creatorLength ?? 'Any'} Creator</Tag>
    {conditions.map((condition) => (
      <Tag variant='gray' key={condition.field}>
        {Array.isArray(condition.value)
          ? `${condition.value.length} ${snakeCaseToSentenceCase(condition.field)}`
          : `${snakeCaseToSentenceCase(condition.field)} ${condition.operator} ${condition.value}`}
      </Tag>
    ))}
  </div>
);

export default PolicyAttributeTags;
