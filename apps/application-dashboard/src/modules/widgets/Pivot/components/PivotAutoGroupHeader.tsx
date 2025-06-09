import { FC, memo } from 'react';
import { cn } from 'utils/common';

interface PivotAutoGroupHeaderPropsType {
  title: string;
  isSingleValue: boolean;
}

const PivotAutoGroupHeader: FC<PivotAutoGroupHeaderPropsType> = ({ title, isSingleValue = false }) => {
  return (
    <div
      className={cn(
        'f-18-450 border-b-0.5 border-b-GRAY_400 border-r-0.5 border-r-GRAY_400 flex h-full w-full items-start bg-white p-6',
        isSingleValue && 'items-center',
      )}
    >
      {title}
    </div>
  );
};

export default memo(PivotAutoGroupHeader);
