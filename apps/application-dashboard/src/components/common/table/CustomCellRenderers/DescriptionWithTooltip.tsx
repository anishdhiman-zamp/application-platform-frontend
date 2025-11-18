import { useEffect, useRef, useState } from 'react';
import type { ICellRendererParams } from 'ag-grid-community';
import { cn } from '@/utils/common';
import TooltipV2 from 'components/common/TooltipV2';

const DescriptionWithTooltip = (params: ICellRendererParams) => {
  const cellRef = useRef<HTMLDivElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);
  const description = params.value || '- -';

  useEffect(() => {
    if (cellRef.current) {
      const element = cellRef.current;

      setIsTruncated(element.scrollWidth > element.clientWidth);
    }
  }, [description]);

  const cellContent = (
    <div
      ref={cellRef}
      className={cn(
        'f-12-400 h-6 max-w-[400px] cursor-pointer truncate rounded-sm px-1.5 py-1 transition-colors duration-200',
        isTruncated && 'hover:bg-gray-50',
        !params.value && 'text-gray-600',
      )}
    >
      {description}
    </div>
  );

  if (isTruncated && description !== '- -') {
    return (
      <TooltipV2 tooltipBody={description} tooltipClassName='max-w-[300px]'>
        {cellContent}
      </TooltipV2>
    );
  }

  return cellContent;
};

export default DescriptionWithTooltip;
