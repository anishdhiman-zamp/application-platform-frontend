import { ChangeEvent, FC, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { ICON_SPRITE_TYPES } from '@zamp-platform/ui/types';
import { SIZE_TYPES } from 'types/common/components';
import { MapAny, OptionsType, SIDE_OPTIONS } from 'types/commonTypes';
import { camelCaseToNormalText, cn, debounce } from 'utils/common';
import TooltipV2 from '@/components/common/TooltipV2';
import { CheckBox } from 'components/common/Checkbox';
import Input from 'components/common/input';
import { FILTER_TYPES, MultiSelectFilterValue } from 'components/filter/filter.types';
import { getDisplayString, getValueString } from 'components/filter/filter.utils';
import { CONDITION_OPERATOR_TYPE, MULTI_SELECT_FILTER_OPTIONS } from 'components/filter/filters.constants';

export interface MultiSelectFilterProps {
  filterKey: string;
  values: MultiSelectFilterValue[];
  className?: string;
  LabelComponent?: (item: MultiSelectFilterValue) => ReactNode;
  operatorOptions?: OptionsType[];
  isOpen?: boolean;
  showSelectAll?: boolean;
  label?: string;
  isDisabled?: boolean;
  initialSelectedValues?: string[];
  initialOperator?: OptionsType;
  onChange: (value: MapAny) => void;
}

const MultiSelectFilter: FC<MultiSelectFilterProps> = ({
  filterKey,
  values,
  className,
  LabelComponent,
  operatorOptions = MULTI_SELECT_FILTER_OPTIONS,
  isOpen = false,
  showSelectAll = false,
  label,
  isDisabled = false,
  initialSelectedValues = [],
  initialOperator,
  onChange,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [hasScrolled, setHasScrolled] = useState(false);

  const [selectedValues, setSelectedValues] = useState<string[]>(initialSelectedValues);
  const [inputValue, setInputValue] = useState('');
  const [isConditionOpen, setIsConditionOpen] = useState(false);
  const [selectedOperator, setSelectedOperator] = useState<OptionsType>(initialOperator || operatorOptions[0]);
  const [isSelectAll, setIsSelectAll] = useState(false);

  const isNullOperator = useMemo(() => selectedOperator?.value === CONDITION_OPERATOR_TYPE.IS_NULL, [selectedOperator]);

  const setFilter = useCallback(
    (operator: string, updatedValues: string[]) => {
      const value = {
        [filterKey]: {
          filterType: FILTER_TYPES.MULTI_SELECT,
          type: operator,
          values: updatedValues,
        },
      };

      onChange(value);
    },
    [onChange, filterKey],
  );

  const handleSetValues = useCallback(
    debounce((operator: string, updatedValues: string[]) => {
      setFilter(operator, updatedValues);
    }, 800),
    [setFilter],
  );

  const onSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const onValueChange = (value: MultiSelectFilterValue) => {
    if (isNullOperator) return;

    const valueStr = getValueString(value);
    const updatedValues = selectedValues.includes(valueStr)
      ? selectedValues.filter((item) => item !== valueStr)
      : [...selectedValues, valueStr];

    setSelectedValues(updatedValues);
    handleSetValues(selectedOperator.value as string, updatedValues);
  };

  const onReset = () => {
    setSelectedValues([]);
    setInputValue('');
    setIsSelectAll(false);
    setFilter(selectedOperator.value as string, []);
  };

  const onOperatorChange = (option: OptionsType) => {
    setSelectedOperator(option);
    const newValues = option.value === CONDITION_OPERATOR_TYPE.IS_NULL ? [] : selectedValues;

    setSelectedValues(newValues);
    handleSetValues(option.value as string, newValues);
  };

  const handleScroll = () => {
    if (listRef.current) {
      setHasScrolled(listRef.current.scrollTop > 0);
    }
  };

  useEffect(() => {
    if (inputRef.current && isOpen) {
      inputRef?.current?.focus();
    }
  }, [isOpen]);

  const filteredValues = useMemo(() => {
    const lowerCasedInput = inputValue?.toLowerCase();

    return values?.filter((item) => {
      const displayStr = getDisplayString(item);

      return displayStr && displayStr.toLowerCase().includes(lowerCasedInput);
    });
  }, [values, inputValue]);

  useEffect(() => {
    setIsSelectAll(
      filteredValues?.length > 0 && filteredValues.every((item) => selectedValues.includes(getValueString(item))),
    );
  }, [filteredValues, selectedValues]);

  const onSelectAll = () => {
    const newSelectedValues = isSelectAll
      ? selectedValues.filter((val) => !filteredValues.some((item) => getValueString(item) === val))
      : Array.from(new Set([...selectedValues, ...filteredValues.map(getValueString)]));

    setSelectedValues(newSelectedValues);
    handleSetValues(selectedOperator.value as string, newSelectedValues);
  };

  useEffect(() => {
    if (initialOperator?.value && initialOperator?.value !== selectedOperator?.value) {
      setSelectedOperator(initialOperator);
    }
  }, [initialOperator]);

  useEffect(() => {
    if (initialSelectedValues !== selectedValues) {
      setSelectedValues(initialSelectedValues);
    }
  }, [initialSelectedValues]);

  return (
    <div
      className={cn(
        'border-0.5 border-GRAY_500 shadow-table-filter-menu flex max-h-[330px] w-[218px] min-w-[230px] flex-col gap-2 rounded-md bg-white pt-2 pb-1',
        className,
      )}
    >
      <div className='text-GRAY_600 z-80 flex w-full items-center gap-1 px-2.5'>
        <div className='f-11-400 text-GRAY_700 overflow-hidden text-ellipsis whitespace-nowrap'>
          {label || camelCaseToNormalText(filterKey)}
        </div>
        <div
          className='relative flex grow cursor-pointer items-center gap-[2px] select-none'
          onClick={() => !isDisabled && setIsConditionOpen(!isConditionOpen)}
        >
          <div className='f-11-500 text-BLUE_700 max-w-[110px] overflow-hidden text-ellipsis whitespace-nowrap'>
            {selectedOperator?.label || 'is equal to'}
          </div>
          <SvgSpriteLoader
            id='chevron-down'
            className={cn(
              'text-GRAY_700 transition-transform duration-300',
              isConditionOpen ? 'rotate-180' : 'rotate-0',
            )}
            height={12}
            width={12}
          />
          {isConditionOpen && (
            <div className='text-GRAY_900 border-GRAY_400 shadow-table-filter-menu absolute top-full left-0 z-10 rounded-md border bg-white p-1'>
              {operatorOptions.map((option) => (
                <div
                  className='hover:bg-GRAY_100 f-12-500 rounded-md px-2.5 py-2 whitespace-nowrap'
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
            onClick={onReset}
          />
        </div>
      </div>
      <div className='px-2.5'>
        <Input
          size={SIZE_TYPES.XSMALL}
          inputRef={inputRef}
          value={inputValue}
          placeholder='type a value...'
          onChange={onSearchChange}
          autoFocus
          disabled={isDisabled}
        />
      </div>
      {showSelectAll && (
        <div
          onClick={() => !isDisabled && onSelectAll()}
          className='hover:bg-GRAY_100 mx-1 flex cursor-pointer items-center justify-between gap-2 rounded px-2.5 py-2 select-none'
        >
          <div className='f-12-400 text-GRAY_1000'>Select All</div>
          <div className='min-w-[14px]'>
            <CheckBox checked={isSelectAll} id='checkbox-1' />
          </div>
        </div>
      )}
      <div
        className={cn(
          'flex h-full flex-col overflow-x-hidden overflow-y-auto px-1 [&::-webkit-scrollbar]:hidden',
          hasScrolled && 'border-GRAY_400 border-t',
        )}
        ref={listRef}
        onScroll={handleScroll}
      >
        {!!filteredValues?.length &&
          filteredValues.map((item) => (
            <div
              key={getValueString(item)}
              onClick={() => !isDisabled && onValueChange(item)}
              className='hover:bg-GRAY_100 flex cursor-pointer items-center justify-between gap-2 rounded px-2.5 py-2 select-none'
            >
              {LabelComponent ? (
                LabelComponent(item)
              ) : (
                <div className='f-12-400 text-GRAY_1000'>{getDisplayString(item)}</div>
              )}
              <TooltipV2
                side={SIDE_OPTIONS.RIGHT}
                key={getValueString(item)}
                tooltipBody={
                  isNullOperator
                    ? `condition set to "${operatorOptions.find((option) => option.value === CONDITION_OPERATOR_TYPE.IS_NULL)?.label}"`
                    : ''
                }
              >
                <div className='min-w-[14px]'>
                  <CheckBox
                    checked={selectedValues?.includes(getValueString(item))}
                    id='checkbox-1'
                    disabled={isNullOperator}
                  />
                </div>
              </TooltipV2>
            </div>
          ))}
      </div>
    </div>
  );
};

export default MultiSelectFilter;
