import React, { ChangeEvent, FC, useCallback, useState } from 'react';
import { ICON_SPRITE_TYPES } from 'constants/icons';
import { SIZE_TYPES } from 'types/common/components';
import { camelCaseToNormalText, debounce } from 'utils/common';
import { CheckBox } from 'components/common/Checkbox';
import Input from 'components/common/input';
import { FILTER_TYPES } from 'components/filter/filter.types';
import { CONDITION_OPERATOR_TYPE } from 'components/filter/filters.constants';
import { filtersContextActions, useFiltersContextStore } from 'components/filter/filters.context';
import SvgSpriteLoader from 'components/SvgSpriteLoader';

interface MultiSelectFilterMenuItemProps {
  column: { colId: string };
  values: string[];
  className?: string;
}

const MultiSelectFilterMenuItem: FC<MultiSelectFilterMenuItemProps> = ({ column, values, className }) => {
  const columnId = column?.colId;
  const {
    state: { selectedFilters },
    dispatch,
  } = useFiltersContextStore();
  const [selectedValues, setSelectedValues] = useState<string[]>(selectedFilters[columnId]?.values || []);
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
            filterType: FILTER_TYPES.MULTI_SELECT,
            type: CONDITION_OPERATOR_TYPE.CONTAINS,
            values: updatedValues,
          },
        },
      },
    });
  };

  const handleSetValues = useCallback(
    debounce((updatedValues: string[]) => {
      setFilter(updatedValues);
    }, 800),
    []
  );

  const onChange = (value: string) => {
    const updatedValues = selectedValues?.includes(value)
      ? selectedValues.filter((item) => item !== value)
      : [...selectedValues, value];

    setSelectedValues(updatedValues);
    handleSetValues(updatedValues);
  };

  const onReset = () => {
    setSelectedValues([]);
    setInputValue('');
    setFilter([]);
  };

  return (
    <div
      className={`flex flex-col gap-2 bg-white py-2 w-[218px] border border-GRAY_400 rounded-md shadow-tableFilterMenu max-h-[330px] ${className}`}
    >
      <div className='flex text-GRAY_600 items-center gap-[2px] w-full z-80 px-2.5'>
        <div className='grow f-11-400 text-GRAY_700 whitespace-nowrap text-ellipsis overflow-hidden'>
          {camelCaseToNormalText(columnId)}
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
                  <div className='min-w-[14px]'>
                    <CheckBox checked={selectedValues?.includes(item)} onPress={() => onChange(item)} id='checkbox-1' />
                  </div>
                </div>
              </div>
            ))}
      </div>
    </div>
  );
};

export default MultiSelectFilterMenuItem;
