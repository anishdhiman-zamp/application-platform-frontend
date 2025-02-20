import { FC, memo, useMemo, useRef, useState } from 'react';
import { Column, GridApi, IRowNode } from 'ag-grid-community';
import { MapAny } from 'types/commonTypes';
import { cn, getCommaSeparatedNumber } from 'utils/common';

interface PivotCellPropsType {
  node: IRowNode;
  value: string | number;
  maxGroupingLevel: number;
  showPercentage?: MapAny;
  column?: Column;
  api?: GridApi;
}

const PivotCell: FC<PivotCellPropsType> = ({ node, value, maxGroupingLevel, showPercentage, api, column }) => {
  const [toggledRows, setToggledRows] = useState<Record<string, boolean>>({});

  const { isLastNode, isTopNode, isRootLevel } = useMemo(() => {
    return {
      isLastNode: node.level === maxGroupingLevel,
      isTopNode: node.level === 0,
      isRootLevel: node.level === -1,
    };
  }, [node.level, maxGroupingLevel]);

  const { only_parent = false } = showPercentage || {};

  const isLastCell = useMemo(() => {
    const displayedColumns = api?.getAllDisplayedColumns();

    return displayedColumns?.[displayedColumns.length - 1] === column;
  }, [column, api]);

  const numericValue = typeof value === 'number' ? value : parseFloat(value.toString().replace(/[$,]/g, ''));

  const aggData = node?.aggData;
  const matchingField = Object.keys(aggData)?.find(
    (key) => parseFloat(aggData[key]?.toFixed(2)) === parseFloat(numericValue?.toFixed(2)),
  );
  const totalValue = matchingField ? (parseFloat(node?.parent?.aggData?.[matchingField]?.toFixed(2)) ?? 0) : 0;
  const isToggled = toggledRows[node?.id || node?.key || ''];

  const percentageValue =
    totalValue > 0
      ? getCommaSeparatedNumber(Math.round(((numericValue || 0) / totalValue) * 100 * 100) / 100, 2) + '%'
      : '0%';

  const shouldShowPercentage = showPercentage && !isRootLevel && (only_parent ? isTopNode : true);

  const displayValue = shouldShowPercentage ? (isToggled ? value : percentageValue) : value;

  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleToggle = () => {
    if (shouldShowPercentage) {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
        clickTimeoutRef.current = null;

        return;
      }

      clickTimeoutRef.current = setTimeout(() => {
        setToggledRows((prev) => ({
          ...prev,
          [node?.id || node?.key || '']: !prev[node?.id || node?.key || ''],
        }));
        clickTimeoutRef.current = null;
      }, 200);
    }
  };

  return (
    <div
      className={cn(
        'h-full w-full flex items-center justify-end gap-3 px-3 py-2 text-GRAY_950 border-b-0.5 border-b-GRAY_400 border-r-0.5 border-r-GRAY_400 f-13-450 cursor-pointer select-none',
        {
          'bg-BACKGROUND_GRAY_1': isLastNode || isRootLevel,
        },
        {
          'border-r-0': isLastCell,
        },
      )}
      onClick={handleToggle}
    >
      {displayValue}
    </div>
  );
};

export default memo(PivotCell);
