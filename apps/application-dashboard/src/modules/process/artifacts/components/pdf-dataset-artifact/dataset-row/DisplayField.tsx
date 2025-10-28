import { useMemo } from 'react';
import { cn } from '@zamp-platform/ui/utils';
import { N_A_VALUE } from '@/modules/process/process.constant';
import { formatRowValue } from '@/modules/process/process.utils';

interface DisplayFieldProps {
  value: string;
  isCompleted: boolean;
  isClicked: boolean;
  onClick: () => void;
  onDoubleClick?: () => void;
  isPdfDataset?: boolean;
}

const DisplayField = ({ value, isCompleted, isClicked, onClick, onDoubleClick, isPdfDataset }: DisplayFieldProps) => {
  const formattedValue = useMemo(() => formatRowValue(value), [value]);

  return (
    <div
      className={cn(
        'f-12-500 bg-GRAY_100 text-GRAY_1000 max-h-40 w-fit max-w-[560px] cursor-pointer overflow-y-scroll rounded-md border border-transparent px-1.5 py-1 break-words transition-colors duration-200 select-none [scrollbar-width:none]',
        {
          'bg-ORANGE_100 underline underline-offset-2': isCompleted,
          'border-BLUE_700': isClicked,
          'max-w-full': isPdfDataset,
          'text-GRAY_400': formattedValue === N_A_VALUE,
        },
      )}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    >
      {formattedValue}
    </div>
  );
};

export default DisplayField;
