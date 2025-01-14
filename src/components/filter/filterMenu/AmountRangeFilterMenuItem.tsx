import React, { useRef, useState } from 'react';
import { ICON_SPRITE_TYPES } from 'constants/icons';
import { useOnClickOutside } from 'hooks';
import { SIZE_TYPES } from 'types/common/components';
import { OptionsType } from 'types/commonTypes';
import { camelCaseToNormalText } from 'utils/common';
import Input from 'components/common/input';
import { AMOUNT_RANGE_FILTER_OPTIONS, CONDITION_OPERATOR_TYPE } from 'components/filter/filters.constants';
import { filtersContextActions, useFiltersContextStore } from 'components/filter/filters.context';
import SvgSpriteLoader from 'components/SvgSpriteLoader';

const AmountRangeFilterMenuItem = ({ column }: { column: any }) => {
    const ref = useRef(null);
    const columnId = column?.colId;
    const { state: { selectedFilters }, dispatch } = useFiltersContextStore();
    const [startValue, setStartValue] = useState(selectedFilters[columnId]?.filter || '');
    const [endValue, setEndValue] = useState(selectedFilters[columnId]?.filterTo || '');
    const [isOpen, setIsOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState<OptionsType>(AMOUNT_RANGE_FILTER_OPTIONS[0]);

    const setFilter = (operator: string, startValue: string, endValue: string) => {
        dispatch({
            type: filtersContextActions.SET_SELECTED_FILTERS, payload: {
                selectedFilters: {
                    [columnId]: {
                        "filterType": "number",
                        "type": operator,
                        "filter": startValue,
                        "filterTo": endValue
                    }
                }
            }
        });
    }

    const onChange = (isStart: boolean, value: string) => {
        if (isStart) setStartValue(value);
        else setEndValue(value);

        setFilter(selectedOption?.value as string, isStart ? value : startValue, isStart ? endValue : value);
    }

    const onOperatorChange = (option: OptionsType) => {
        setSelectedOption(option);
        setFilter(option?.value as string, startValue, endValue);
    }

    const onClear = () => {
        setStartValue('');
        setEndValue('');
        setFilter(selectedOption?.value as string, '', '');
    }

    useOnClickOutside(ref, () => setIsOpen(false));

    return (
        <div className='px-2.5 py-2 w-[218px] border border-GRAY_400 rounded-md bg-white shadow-[1px_2px_10px_0px_#A6A6A61A]'>
            <div className='flex text-GRAY_600 items-center gap-[2px] w-full z-80 mb-2'>
                <div className='f-11-400 text-GRAY_700  whitespace-nowrap text-ellipsis overflow-hidden'>{camelCaseToNormalText(columnId)}</div>
                <div className='flex items-center gap-[2px] cursor-pointer relative select-none grow' onClick={() => setIsOpen(!isOpen)}>
                    <div className='f-11-500 text-BLUE_700 max-w-[110px] whitespace-nowrap text-ellipsis overflow-hidden'>{selectedOption?.label || 'is equal to'}</div>
                    <SvgSpriteLoader
                        id='chevron-down'
                        iconCategory={ICON_SPRITE_TYPES.ARROWS}
                        height={12}
                        width={12}
                    />
                    {isOpen && <div ref={ref} className='p-1 z-10 absolute top-full left-0 w-[256px] bg-white text-GRAY_900 border border-GRAY_400 shadow-tableFilterMenu1px 2px 10px 0px #A6A6A61A] rounded-md'>
                        {
                            AMOUNT_RANGE_FILTER_OPTIONS.map((option) => (
                                <div className='hover:bg-GRAY_100 f-12-500 py-2 px-2.5 rounded-md' key={option.value} onClick={() => onOperatorChange(option)}>{option.label}</div>
                            ))
                        }
                    </div>}
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
                    size={SIZE_TYPES.XSMALL}
                    value={startValue}
                    placeholder='type a value...'
                    onChange={(e) => onChange(true, e.target.value)}
                />
                {selectedOption?.value === CONDITION_OPERATOR_TYPE.IN_BETWEEN && <span className='f-11-400 text-GRAY_700 select-none'>and</span>}
                {selectedOption?.value === CONDITION_OPERATOR_TYPE.IN_BETWEEN && <Input
                    size={SIZE_TYPES.XSMALL}
                    value={endValue}
                    placeholder='type a value...'
                    onChange={(e) => onChange(false, e.target.value)}
                />}
            </div>
        </div>
    );
};

export default AmountRangeFilterMenuItem;
