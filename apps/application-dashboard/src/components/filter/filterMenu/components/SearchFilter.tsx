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
      className={`px-2.5 py-2 min-w-[218px] border-0.5 border-GRAY_500 rounded-md bg-white shadow-table-filter-menu ${className}`}
    >
      <div className='flex text-GRAY_600 items-center gap-1 w-full z-80 mb-2'>
        <div className='f-11-400 text-GRAY_700  whitespace-nowrap'>{label || camelCaseToNormalText(filterKey)}</div>
        <div
          className='flex items-center gap-[2px] cursor-pointer relative select-none grow mr-2'
          onClick={() => !isDisabled && !isConditionOptionsOpen && setIsConditionOptionsOpen((prev) => !prev)}
        >
          <div className='f-11-500 text-BLUE_700 max-w-[110px] whitespace-nowrap text-ellipsis overflow-hidden'>
            {selectedOperator?.label || 'is equal to'}
          </div>
          <SvgSpriteLoader id='chevron-down' iconCategory={ICON_SPRITE_TYPES.ARROWS} height={12} width={12} />
          {isConditionOptionsOpen && (
            <div
              ref={ref}
              className='p-1 z-10 absolute top-full left-0 w-[256px] bg-white text-GRAY_900 border border-GRAY_400 shadow-table-filter-menu rounded-md'
            >
              {SEARCH_FILTER_OPTIONS.map((option) => (
                <div
                  className='hover:bg-GRAY_100 f-12-500 py-2 px-2.5 rounded-md'
                  key={option.value}
                  onClick={() => onOperatorChange(option)}
                >
                  {option.label}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className='flex justify-end text-GRAY_700 cursor-pointer'>
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
