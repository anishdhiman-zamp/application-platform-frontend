import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { ICON_SPRITE_TYPES } from 'constants/icons';
import { debounce, useOnClickOutside } from 'hooks';
import { SIZE_TYPES } from 'types/common/components';
import { OptionsType } from 'types/commonTypes';
import { camelCaseToNormalText } from 'utils/common';
import Input from 'components/common/input';
import { Tooltip } from 'components/common/tooltip';
import { AmountRangeFilterValue, FILTER_TYPES } from 'components/filter/filter.types';
import { AMOUNT_RANGE_FILTER_OPTIONS, CONDITION_OPERATOR_TYPE } from 'components/filter/filters.constants';

interface AmountRangeFilterProps {
  className?: string;
  label?: string;
  isDisabled?: boolean;
  initialOperator?: OptionsType;
  initialStartValue?: string;
  initialEndValue?: string;
  onChange: (value: Record<string, AmountRangeFilterValue | object>) => void;
  filterKey: string;
}

const AmountRangeFilter: FC<AmountRangeFilterProps> = ({
  className,
  label,
  isDisabled = false,
  filterKey,
  initialOperator,
  initialStartValue,
  initialEndValue,
  onChange,
}) => {
  const ref = useRef(null);

  const [startValue, setStartValue] = useState(initialStartValue || '');
  const [endValue, setEndValue] = useState(initialEndValue || '');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOperator, setSelectedOperator] = useState<OptionsType>(
    initialOperator ?? AMOUNT_RANGE_FILTER_OPTIONS[0],
  );

  const setFilter = (operator: string, startValue: string, endValue: string) => {
    const condition =
      operator === CONDITION_OPERATOR_TYPE.IN_BETWEEN
        ? endValue !== '' && startValue !== ''
        : operator === CONDITION_OPERATOR_TYPE.IS_NULL
          ? true
          : startValue !== '';

    const value: Record<string, AmountRangeFilterValue | object> = {
      [filterKey]: condition
        ? {
            filterType: FILTER_TYPES.AMOUNT_RANGE,
            type: operator,
            filter: startValue,
            filterTo: endValue,
          }
        : {},
    };

    onChange(value);
  };

  const handleSetValues = useCallback(
    debounce((operator: string, startValue: string, endValue: string) => {
      setFilter(operator, startValue, endValue);
    }, 800),
    [],
  );

  const onInputChange = (isStart: boolean, value: string) => {
    if (isStart) setStartValue(value);
    else setEndValue(value);

    handleSetValues(selectedOperator?.value as string, isStart ? value : startValue, isStart ? endValue : value);
  };

  const onOperatorChange = (option: OptionsType) => {
    setSelectedOperator(option);
    handleSetValues(option?.value as string, startValue, endValue);
  };

  const onClear = () => {
    setStartValue('');
    setEndValue('');
    setFilter(selectedOperator?.value as string, '', '');
  };

  useOnClickOutside(ref, () => setIsOpen(false));

  useEffect(() => {
    if (initialOperator?.value && initialOperator?.value !== selectedOperator?.value) {
      setSelectedOperator(initialOperator);
    }
  }, [initialOperator]);

  useEffect(() => {
    if (initialStartValue !== undefined && initialStartValue !== startValue) {
      setStartValue(initialStartValue);
    }
  }, [initialStartValue]);

  useEffect(() => {
    if (initialEndValue !== undefined && initialEndValue !== endValue) {
      setEndValue(initialEndValue);
    }
  }, [initialEndValue]);

  return (
    <div
      className={`border-0.5 border-GRAY_500 shadow-table-filter-menu w-[250px] min-w-[250px] rounded-md bg-white px-2.5 py-2 ${className}`}
    >
      <div className='text-GRAY_600 z-80 mb-2 flex w-full items-center gap-1'>
        <div className='f-11-400 text-GRAY_700 overflow-hidden text-ellipsis whitespace-nowrap'>
          {label || camelCaseToNormalText(filterKey)}
        </div>
        <div
          className='relative mr-4 flex grow cursor-pointer select-none items-center gap-[2px]'
          onClick={() => !isDisabled && setIsOpen(!isOpen)}
        >
          <div className='f-11-500 text-BLUE_700 max-w-[110px] overflow-hidden text-ellipsis whitespace-nowrap'>
            {selectedOperator?.label || 'is equal to'}
          </div>
          <SvgSpriteLoader id='chevron-down' iconCategory={ICON_SPRITE_TYPES.ARROWS} height={12} width={12} />
          {isOpen && (
            <div
              ref={ref}
              className='text-GRAY_900 border-GRAY_400 shadow-table-filter-menu absolute left-0 top-full z-10 w-[256px] rounded-md border bg-white p-1'
            >
              {AMOUNT_RANGE_FILTER_OPTIONS.map((option) => (
                <div
                  className='hover:bg-GRAY_100 f-12-500 rounded-md px-2.5 py-2'
                  key={option.value}
                  onClick={() => onOperatorChange(option)}
                >
                  {option.label}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className='text-GRAY_700 flex cursor-pointer justify-end'>
          <SvgSpriteLoader
            id='refresh-ccw-01'
            iconCategory={ICON_SPRITE_TYPES.ARROWS}
            height={14}
            width={14}
            onClick={onClear}
          />
        </div>
      </div>
      <div className='flex flex-col gap-2'>
        <Tooltip
          tooltipBody={`condition set to “is blank”`}
          tooltipBodyClassName='f-12-300 px-3 py-1.5 rounded-md whitespace-nowrap z-999 bg-black text-white'
          className='z-1 cursor-not-allowed!'
          disabled={selectedOperator?.value !== CONDITION_OPERATOR_TYPE.IS_NULL}
        >
          <Input
            size={SIZE_TYPES.XSMALL}
            value={startValue}
            placeholder='type a value...'
            onChange={(e) => onInputChange(true, e.target.value)}
            disabled={selectedOperator?.value === CONDITION_OPERATOR_TYPE.IS_NULL || isDisabled}
            autoFocus
          />
        </Tooltip>
        {selectedOperator?.value === CONDITION_OPERATOR_TYPE.IN_BETWEEN && (
          <span className='f-11-400 text-GRAY_700 select-none'>and</span>
        )}
        {selectedOperator?.value === CONDITION_OPERATOR_TYPE.IN_BETWEEN && (
          <Input
            size={SIZE_TYPES.XSMALL}
            value={endValue}
            placeholder='type a value...'
            onChange={(e) => onInputChange(false, e.target.value)}
            disabled={isDisabled}
          />
        )}
      </div>
    </div>
  );
};

export default AmountRangeFilter;
