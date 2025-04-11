import { FC, memo, useMemo, useRef, useState } from 'react';
import { Column, GridApi, IRowNode } from 'ag-grid-community';
import { CURRENCY_SYMBOLS } from 'modules/page/pages.constants';
import { DISPLAY_CONFIG_CELL_TYPE, DisplayConfigStyleType } from 'modules/widgets/displayConfig/displayConfig.types';
import { AllPivotColumnsToHideType } from 'modules/widgets/Pivot/pivot.types';
import { MapAny } from 'types/commonTypes';
import { cn, getCommaSeparatedNumber } from 'utils/common';
import { getCellStyle } from '@/modules/widgets/displayConfig/DisplayConfig';

interface TreeCellProps {
  node: IRowNode;
  value: string | number;
  showPercentage?: MapAny;
  column?: Column;
  api?: GridApi;
  currency?: string;
  childIndex?: number;
  groupData?: MapAny;
  hiddenColIds?: string[];
  gridApi?: GridApi;
  setAllPivotColumnsToHide: React.Dispatch<React.SetStateAction<AllPivotColumnsToHideType[]>>;
  currentWidgetInstanceId?: string;
  displayConfigStyle?: DisplayConfigStyleType;
}

const TreeCell: FC<TreeCellProps> = ({
  node,
  value,
  showPercentage,
  api,
  column,
  currency,
  childIndex,
  setAllPivotColumnsToHide,
  currentWidgetInstanceId,
  displayConfigStyle,
}) => {
  const [toggledRows, setToggledRows] = useState<Record<string, boolean>>({});
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const formattedValue = useMemo(() => {
    const parsedValue = parseFloat(value?.toString().replace(/[^0-9.-]/g, '') || '0');
    const numericValue = typeof value === 'number' ? value : parsedValue;

    if (isNaN(numericValue)) return '-';

    const currencySymbol = CURRENCY_SYMBOLS[currency as keyof typeof CURRENCY_SYMBOLS] ?? currency;

    return currency ? `${currencySymbol} ${getCommaSeparatedNumber(numericValue, 2)}` : numericValue;
  }, [currency, value]);

  const { isLeafNode, isRootLevel } = useMemo(
    () => ({
      isLeafNode: !node.childrenAfterFilter || node.childrenAfterFilter.length === 0,
      isRootLevel: node.level === -1,
    }),
    [node],
  );

  const isLastCell = useMemo(() => {
    const displayedColumns = api?.getAllDisplayedColumns();

    return displayedColumns?.[displayedColumns.length - 1] === column;
  }, [column, api]);

  const numericValue = useMemo(() => {
    return typeof value === 'number' ? value : parseFloat(value?.toString().replace(/[$,]/g, ''));
  }, [value]);

  // Calculate percentage based on parent node's value
  const parentValue = node.parent?.data
    ? (Object.values(node.parent.data).find(
        (val) => typeof val === 'number' && val !== node.data[column?.getColId() || ''],
      ) as number)
    : 0;

  const percentageValue = useMemo(() => {
    if (!parentValue || parentValue === 0) return '0.00%';

    return `${getCommaSeparatedNumber(((numericValue || 0) / parentValue) * 100, 2)}%`;
  }, [numericValue, parentValue]);

  const isToggled = toggledRows[node?.id || node?.key || ''];
  const { only_parent = false } = showPercentage || {};

  const shouldShowPercentage = showPercentage && !isRootLevel && (only_parent ? !isLeafNode : true);
  const displayValue = shouldShowPercentage ? (isToggled ? formattedValue : percentageValue) : formattedValue;

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

  const resultantConfigStyles = getCellStyle({
    node: node,
    level: node?.level,
    childIndex: childIndex,
    column: column,
    value: value,
    rowParentFieldGreaterByOne: node?.parent?.key,
    rowGroupField: node?.key,
    columnId: column?.getColId(),
    columnGroupId: column?.getParent()?.getGroupId(),
    cellType: DISPLAY_CONFIG_CELL_TYPE.DATA_CELL,
    setAllPivotColumnsToHide: setAllPivotColumnsToHide,
    currentWidgetInstanceId: currentWidgetInstanceId,
    displayConfigStyle: displayConfigStyle,
  });

  return (
    <div
      className={cn(
        'h-full w-full flex items-center justify-end gap-3 px-3 py-2 text-GRAY_950 border-b-0.5 border-b-GRAY_400 border-r-0.5 border-r-GRAY_400 f-13-450 cursor-pointer select-none hover:bg-GRAY_100',
        {
          'bg-BACKGROUND_GRAY_1': isLeafNode || isRootLevel,
          'border-r-0': isLastCell,
          'border-b-0': isRootLevel,
        },
      )}
      style={{
        ...resultantConfigStyles,
      }}
      onClick={handleToggle}
    >
      {displayValue}
    </div>
  );
};

export default memo(TreeCell);
