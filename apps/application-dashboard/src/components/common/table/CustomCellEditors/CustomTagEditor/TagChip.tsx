import { FC, useMemo } from 'react';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { cn, getTagColor } from 'utils/common';

type TagChipProps = { item: string; existingList?: string[]; showIcon?: boolean; externalColor?: string };

const TagChip: FC<TagChipProps> = ({ item, existingList, showIcon = false, externalColor }) => {
  const isExisting = useMemo(() => {
    const flattenedList: string[] = [];

    existingList?.forEach((listItem) => {
      listItem?.split('.')?.forEach((item) => {
        flattenedList.push(item);
      });
    });

    return flattenedList?.includes(item);
  }, [existingList, item]);

  const backgroundColor = useMemo(getTagColor, [item]);

  return (
    <span
      className={cn(isExisting ? '' : 'f-11-400 text-GRAY_1000 flex w-fit items-center rounded-md px-1.5 py-1')}
      style={isExisting ? {} : { backgroundColor: externalColor ?? backgroundColor }}
    >
      {showIcon && <SvgSpriteLoader id='lightning-01' className='mr-1' height={12} width={12} />}
      <span>{item}</span>
    </span>
  );
};

export default TagChip;
