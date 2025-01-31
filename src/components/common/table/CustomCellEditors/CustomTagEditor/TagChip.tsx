import { FC, useMemo } from 'react';
import { cn, getChipColor } from 'utils/common';

type TagChipProps = { item: string; existingList?: string[] };

const TagChip: FC<TagChipProps> = ({ item, existingList }) => {
  const isExisting = useMemo(() => existingList?.includes(item), [existingList, item]);
  const backgroundColor = useMemo(() => getChipColor(), []);

  return (
    <span
      className={cn(isExisting ? '' : 'f-11-400 py-1 px-1.5 rounded-md text-GRAY_1000')}
      style={isExisting ? {} : { backgroundColor }}
    >
      {item}
    </span>
  );
};

export default TagChip;
