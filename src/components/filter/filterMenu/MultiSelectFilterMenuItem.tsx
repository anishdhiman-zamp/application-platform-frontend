import React, { ChangeEvent, FC, useRef, useState } from 'react';
import { ICON_SPRITE_TYPES } from 'constants/icons';
import { useOnClickOutside } from 'hooks';
import { SIZE_TYPES } from 'types/common/components';
import { camelCaseToNormalText } from 'utils/common';
import { CheckBox } from 'components/common/Checkbox';
import Input from 'components/common/input';
import { MULTI_SELECT_FILTER_OPTIONS } from 'components/filter/filters.constants';
import { filtersContextActions, useFiltersContextStore } from 'components/filter/filters.context';
import SvgSpriteLoader from 'components/SvgSpriteLoader';

interface MultiSelectFilterMenuItemProps {
  column: { colId: string };
  values: string[];
  className?: string;
}

const MultiSelectFilterMenuItem: FC<MultiSelectFilterMenuItemProps> = ({ column, values, className }) => {
  const ref = useRef(null);
  const columnId = column?.colId;
  const {
    state: { selectedFilters },
    dispatch,
  } = useFiltersContextStore();
  const [selectedValues, setSelectedValues] = useState<string[]>(selectedFilters[columnId]?.values || []);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(MULTI_SELECT_FILTER_OPTIONS[0]);
  const [inputValue, setInputValue] = useState('');
  const onSearchChange = (value: ChangeEvent<HTMLInputElement>) => {
    setInputValue(value.target.value);
  };

  const setFilter = (updatedValues: string[]) => {
    dispatch({
      type: filtersContextActions.SET_SELECTED_FILTERS,
      payload: {
        selectedFilters: {
          [columnId]: {
            filterType: 'set',
            type: selectedOption.value,
            values: updatedValues,
          },
        },
      },
    });
  };

  const onChange = (value: string) => {
    const updatedValues = selectedValues?.includes(value)
      ? selectedValues.filter((item) => item !== value)
      : [...selectedValues, value];

    setSelectedValues(updatedValues);
    setFilter(updatedValues);
  };

  const onReset = () => {
    setSelectedValues([]);
    setInputValue('');
    setFilter([]);
  };

  useOnClickOutside(ref, () => setIsOpen(false));

  return (
    <div
      className={`flex flex-col gap-2 bg-white py-2 w-[218px] border border-GRAY_400 rounded-md shadow-tableFilterMenu max-h-[330px] ${className}`}
    >
      <div className='flex text-GRAY_600 items-center gap-[2px] w-full z-80 px-2.5'>
        <div className='grow f-11-400 text-GRAY_700 whitespace-nowrap text-ellipsis overflow-hidden'>
          {camelCaseToNormalText(columnId)}
        </div>
        <div
          className='hidden items-center gap-[2px] cursor-pointer relative select-none grow'
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className='f-11-500 text-BLUE_700 max-w-[110px] whitespace-nowrap text-ellipsis overflow-hidden'>
            {selectedOption?.label || 'is equal to'}
          </div>
          <SvgSpriteLoader id='chevron-down' iconCategory={ICON_SPRITE_TYPES.ARROWS} height={12} width={12} />
          {isOpen && (
            <div
              ref={ref}
              className=' p-1 z-10 absolute top-full left-0 w-[256px] bg-white text-GRAY_900 border border-GRAY_400 shadow-tableFilterMenu rounded-md'
            >
              {MULTI_SELECT_FILTER_OPTIONS.map((option) => (
                <div
                  className='hover:bg-GRAY_100 f-12-500 py-2 px-2.5 rounded-md'
                  key={option.value}
                  onClick={() => setSelectedOption(option)}
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
            onClick={onReset}
          />
        </div>
      </div>
      <div className='px-2.5'>
        <Input size={SIZE_TYPES.XSMALL} value={inputValue} placeholder='type a value...' onChange={onSearchChange} />
      </div>
      <div className='flex flex-col gap-1.5 h-full overflow-y-auto custom-scroll-bar-common'>
        {!!values?.length &&
          values
            .filter((item) => item?.includes(inputValue))
            .map((item) => (
              <div key={item}>
                <div className='flex items-center gap-2 justify-between py-1 px-2.5'>
                  <div className='f-12-400 text-GRAY_1000'>{item}</div>
                  <CheckBox checked={selectedValues?.includes(item)} onPress={() => onChange(item)} id='checkbox-1' />
                </div>
              </div>
            ))}
      </div>
    </div>
  );
};

export default MultiSelectFilterMenuItem;
