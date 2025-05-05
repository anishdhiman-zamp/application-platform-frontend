import { FC } from 'react';
import { cn } from '@/utils/common';
import TagChip from 'components/common/table/CustomCellEditors/CustomTagEditor/TagChip';
import { getTagLabel, getTagParents } from 'components/filter/filter.utils';

type TagWithHierarchyProps = { tag: string; labelColor?: string; isReadOnly?: boolean; isSelected?: boolean };

const TagWithHierarchy: FC<TagWithHierarchyProps> = ({ tag, labelColor, isReadOnly, isSelected }) => {
  return (
    <div
      className={cn('space-y-1', {
        'hover:bg-GRAY_100 p-1 mx-1 rounded-md cursor-pointer': !isReadOnly || isSelected,
        'bg-GRAY_100': isSelected,
      })}
    >
      <div className='flex items-center'>
        <TagChip item={getTagLabel(tag)} externalColor={labelColor} />
      </div>
      <div className='f-11-400 text-GRAY_700 ml-1'>{getTagParents(tag)}</div>
    </div>
  );
};

export default TagWithHierarchy;
