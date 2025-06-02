import React, { ChangeEvent, FC, ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { ICON_SPRITE_TYPES } from 'constants/icons';
import { SIZE_TYPES } from 'types/common/components';
import { MapAny } from 'types/commonTypes';
import { cn, debounce, formatToNormalText } from 'utils/common';
import Input from 'components/common/input';
import { FILTER_TYPES } from 'components/filter/filter.types';
import { CONDITION_OPERATOR_TYPE } from 'components/filter/filters.constants';

export interface SingleSelectFilterProps {
  filterKey: string;
  values: string[];
  className?: string;
  LabelComponent?: (item: string) => ReactNode;
  allowClear?: boolean;
  allowSearch?: boolean;
  debounceTime?: number;
  isOpen?: boolean;
  showColumnLabel?: boolean;
  isDisabled?: boolean;
  initialSelectedValue?: string;
  onChange: (value: MapAny) => void;
}

const SingleSelectFilter: FC<SingleSelectFilterProps> = ({
  filterKey,
  values,
  className,
  LabelComponent,
  allowClear = true,
  allowSearch = true,
  debounceTime = 800,
  isOpen = false,
  showColumnLabel = true,
  isDisabled = false,
  initialSelectedValue = '',
  onChange,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedValue, setSelectedValue] = useState<string>(initialSelectedValue);
  const [inputValue, setInputValue] = useState('');

  const onSearchChange = (value: ChangeEvent<HTMLInputElement>) => {
    setInputValue(value.target.value);
  };

  const setFilter = useCallback(
    (updatedValue: string) => {
      const value = {
        [filterKey]: {
          filterType: FILTER_TYPES.SINGLE_SELECT,
          type: CONDITION_OPERATOR_TYPE.EQUAL,
          values: [updatedValue],
        },
      };

      onChange(value);
    },
    [onChange, filterKey],
  );

  const handleSetValues = useCallback(
    debounce((updatedValue: string) => {
      setFilter(updatedValue);
    }, debounceTime),
    [setFilter, debounceTime],
  );

  const onValueChange = (value: string) => {
    setSelectedValue(value);
    handleSetValues(value);
  };

  const onReset = () => {
    setSelectedValue('');
    setInputValue('');
    setFilter('');
  };

  useEffect(() => {
    if (inputRef.current && isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  return (
    <div
      className={cn(
        'flex flex-col gap-2 bg-white pt-2 pb-1 border border-GRAY_400 rounded-md shadow-tableFilterMenu max-h-[330px] w-[218px] min-w-[218px]',
        className,
      )}
    >
      <div className='flex text-GRAY_600 items-center gap-1 w-full z-80 px-2.5'>
        {showColumnLabel && (
          <div className='grow f-11-400 text-GRAY_700 whitespace-nowrap text-ellipsis overflow-hidden'>
            {formatToNormalText(filterKey)}
          </div>
        )}

        {allowClear && (
          <div className='flex justify-end text-GRAY_700 cursor-pointer'>
            <SvgSpriteLoader
              id='refresh-ccw-01'
              iconCategory={ICON_SPRITE_TYPES.ARROWS}
              height={14}
              width={14}
              onClick={onReset}
            />
          </div>
        )}
      </div>
      {allowSearch && (
        <div className='px-2.5'>
          <Input
            size={SIZE_TYPES.XSMALL}
            inputRef={inputRef}
            value={inputValue}
            placeholder='Search...'
            onChange={onSearchChange}
            disabled={isDisabled}
          />
        </div>
      )}
      <div className='flex flex-col h-full overflow-y-auto px-1 [&::-webkit-scrollbar]:hidden'>
        {!!values?.length &&
          values
            .filter((item) => item?.toLowerCase()?.includes(inputValue?.toLowerCase()))
            .map((item) => (
              <div
                key={item}
                onClick={() => !isDisabled && onValueChange(item)}
                className={cn(
                  'py-2 px-2.5 border-2.5 cursor-pointer select-none rounded hover:bg-GRAY_100',
                  selectedValue === item && 'bg-GRAY_200',
                )}
              >
                {LabelComponent ? LabelComponent(item) : <div className='f-12-400 text-GRAY_1000'>{item}</div>}
              </div>
            ))}
      </div>
    </div>
  );
};

export default SingleSelectFilter;
