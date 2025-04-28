import { useMemo } from 'react';
import { COLORS } from '@/constants/colors';
import { cn } from '@/utils/common';
import TagChip from 'components/common/table/CustomCellEditors/CustomTagEditor/TagChip';

type CustomChipsRendererProps = {
  value: string | string[];
  className?: string;
};

const CustomChipRenderer = ({ value, className = '' }: CustomChipsRendererProps) => {
  const chips = useMemo(() => {
    return Array.isArray(value) ? value : value?.split(',');
  }, [value]);

  return (
    <div className={cn(`flex gap-2 w-full`, className)}>
      {chips?.map((chip: string, index: number) => (
        <div key={chip + index}>
          <TagChip item={chip} externalColor={COLORS.GRAY_50} />
        </div>
      ))}
    </div>
  );
};

export default CustomChipRenderer;
