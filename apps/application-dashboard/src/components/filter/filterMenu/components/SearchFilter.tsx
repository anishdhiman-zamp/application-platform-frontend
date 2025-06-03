import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { ICON_SPRITE_TYPES } from 'constants/icons';
import { useOnClickOutside } from 'hooks';
import { SIZE_TYPES } from 'types/common/components';
import { MapAny, OptionsType } from 'types/commonTypes';
import { camelCaseToNormalText, debounce } from 'utils/common';
import Input from 'components/common/input';
import { FILTER_TYPES } from 'components/filter/filter.types';
import { SEARCH_FILTER_OPTIONS } from 'components/filter/filters.constants';

export interface SearchFilterProps {
  filterKey: string;
  className?: string;
  isOpen?: boolean;
  label?: string;
  isDisabled?: boolean;
  initialSearchValue?: string;
  initialOperator?: OptionsType;
  onChange: (value: MapAny) => void;
}

const SearchFilter: FC<SearchFilterProps> = ({
  filterKey,
  className,
  isOpen = false,
  label,
  isDisabled = false,
  initialSearchValue = '',
  initialOperator,
  onChange,
}) => {
  const ref = useRef(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchValue, setSearchValue] = useState(initialSearchValue);
  const [isConditionOptionsOpen, setIsConditionOptionsOpen] = useState(false);
  const [selectedOperator, setSelectedOperator] = useState<OptionsType>(initialOperator ?? SEARCH_FILTER_OPTIONS[0]);

  const setFilter = useCallback(
    (operator: string, searchValue: string) => {
      const value = {
        [filterKey]: searchValue
          ? {
              filterType: FILTER_TYPES.SEARCH,
              type: operator,
              filter: searchValue,
            }
          : {},
      };

      onChange(value);
    },
    [onChange, filterKey],
  );

  const handleSetValues = useCallback(
    debounce((operator: string, searchValue: string) => {
      setFilter(operator, searchValue);
    }, 800),
    [setFilter],
  );

  const onSearchChange = (value: string) => {
    setSearchValue(value);
    handleSetValues(selectedOperator?.value as string, value);
  };

  const onOperatorChange = (option: OptionsType) => {
    setIsConditionOptionsOpen(false);
    setSelectedOperator(option);
    handleSetValues(option?.value as string, searchValue);
  };

  const onClear = () => {
    setSearchValue('');
    setFilter(selectedOperator?.value as string, '');
  };

  useOnClickOutside(ref, () => setIsConditionOptionsOpen(false));

  useEffect(() => {
    if (inputRef.current) {
      inputRef?.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialOperator?.value && initialOperator?.value !== selectedOperator?.value) {
      setSelectedOperator(initialOperator);
    }
  }, [initialOperator]);

  useEffect(() => {
    if (initialSearchValue !== searchValue) {
      setSearchValue(initialSearchValue);
    }
  }, [initialSearchValue]);

  return (
    <div
      className={`border-0.5 border-GRAY_500 shadow-table-filter-menu min-w-[218px] rounded-md bg-white px-2.5 py-2 ${className}`}
    >
      <div className='text-GRAY_600 z-80 mb-2 flex w-full items-center gap-1'>
        <div className='f-11-400 text-GRAY_700 whitespace-nowrap'>{label || camelCaseToNormalText(filterKey)}</div>
        <div
          className='relative mr-2 flex grow cursor-pointer select-none items-center gap-[2px]'
          onClick={() => !isDisabled && !isConditionOptionsOpen && setIsConditionOptionsOpen((prev) => !prev)}
        >
          <div className='f-11-500 text-BLUE_700 max-w-[110px] overflow-hidden text-ellipsis whitespace-nowrap'>
            {selectedOperator?.label || 'is equal to'}
          </div>
          <SvgSpriteLoader id='chevron-down' iconCategory={ICON_SPRITE_TYPES.ARROWS} height={12} width={12} />
          {isConditionOptionsOpen && (
            <div
              ref={ref}
              className='text-GRAY_900 border-GRAY_400 shadow-table-filter-menu absolute left-0 top-full z-10 w-[256px] rounded-md border bg-white p-1'
            >
              {SEARCH_FILTER_OPTIONS.map((option) => (
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
        <Input
          inputRef={inputRef}
          size={SIZE_TYPES.XSMALL}
          value={searchValue}
          placeholder='type a value...'
          onChange={(e) => onSearchChange(e.target.value)}
          disabled={isDisabled}
        />
      </div>
    </div>
  );
};

export default SearchFilter;
