import React, { ChangeEvent, FC, useCallback, useState } from 'react';
import { ICON_SPRITE_TYPES } from 'constants/icons';
import { SIZE_TYPES } from 'types/common/components';
import { camelCaseToNormalText, cn, debounce } from 'utils/common';
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
  LabelComponent?: (item: string) => React.ReactNode;
}

const MultiSelectFilterMenuItem: FC<MultiSelectFilterMenuItemProps> = ({
  column,
  values,
  className,
  LabelComponent,
}) => {
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
    [],
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
      className={cn(
        'flex flex-col gap-2 bg-white pt-2 pb-1 w-[218px] border-0.5 border-GRAY_500 rounded-md shadow-tableFilterMenu max-h-[330px]',
        className,
      )}
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
      <div className='flex flex-col h-full overflow-y-auto px-1 [&::-webkit-scrollbar]:hidden'>
        {!!values?.length &&
          values
            .filter((item) => item?.includes(inputValue))
            .map((item) => (
              <div
                key={item}
                onClick={() => onChange(item)}
                className='flex items-center gap-2 justify-between py-2 px-2.5 cursor-pointer select-none rounded hover:bg-GRAY_100'
              >
                {LabelComponent ? LabelComponent(item) : <div className='f-12-400 text-GRAY_1000'>{item}</div>}
                <div className='min-w-[14px]'>
                  <CheckBox checked={selectedValues?.includes(item)} id='checkbox-1' />
                </div>
              </div>
            ))}
      </div>
    </div>
  );
};

export default MultiSelectFilterMenuItem;
