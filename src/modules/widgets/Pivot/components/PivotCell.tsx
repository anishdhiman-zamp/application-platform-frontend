import { FC, memo, useMemo, useState } from 'react';
import { IRowNode } from 'ag-grid-community';
import { cn, getCommaSeparatedNumber } from 'utils/common';

interface PivotCellPropsType {
  node: IRowNode;
  value: string | number;
  maxGroupingLevel: number;
}

const PivotCell: FC<PivotCellPropsType> = ({ node, value, maxGroupingLevel }) => {
  const [toggledRows, setToggledRows] = useState<Record<string, boolean>>({});

  const { isLastNode, isTopNode, isRootLevel } = useMemo(() => {
    return {
      isLastNode: node.level === maxGroupingLevel,
      isTopNode: node.level === 0,
      isRootLevel: node.level === -1,
    };
  }, [node.level, maxGroupingLevel]);

  const numericValue = typeof value === 'number' ? value : parseFloat(value.toString().replace(/[$,]/g, ''));

  const aggData = node?.aggData;
  const matchingField = Object.keys(aggData).find(
    (key) => parseFloat(aggData[key]?.toFixed(2)) === parseFloat(numericValue?.toFixed(2)),
  );
  const totalValue = matchingField ? (parseFloat(node?.parent?.aggData?.[matchingField].toFixed(2)) ?? 0) : 0;
  const isToggled = toggledRows[node?.id || node?.key || ''];

  const percentageValue =
    totalValue > 0
      ? getCommaSeparatedNumber(Math.round(((numericValue || 0) / totalValue) * 100 * 100) / 100, 2) + '%'
      : '0%';

  const displayValue = isTopNode ? (isToggled ? value : percentageValue) : value;

  const handleToggle = () => {
    if (isTopNode) {
      setToggledRows((prev) => ({
        ...prev,
        [node?.id || node?.key || '']: !prev[node?.id || node?.key || ''],
      }));
    }
  };

  return (
    <div
      className={cn(
        'h-full w-full flex items-center justify-end gap-3 px-3 py-2 text-GRAY_950 border-b-0.5 border-b-GRAY_400 border-r-0.5 border-r-GRAY_400 f-13-450 cursor-pointer select-none',
        {
          'bg-BACKGROUND_GRAY_1': isLastNode || isRootLevel,
        },
      )}
      onClick={handleToggle}
    >
      {displayValue}
    </div>
  );
};

export default memo(PivotCell);
