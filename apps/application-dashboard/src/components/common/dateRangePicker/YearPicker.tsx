import React, { FC, useEffect, useRef, useState } from 'react';
import { RangeFocus } from 'react-date-range';
import { DATE_RANGE_TYPES, DateRangeKeys, DateRangeValue } from '@zamp-platform/utils';
import { MapAny } from 'types/commonTypes';
import { getStartOfYear } from 'utils/common';
import { getYearList } from 'components/common/dateRangePicker/dateRangePicker.utils';

interface YearPickerProps {
  onSelect: (value: DateRangeValue) => void;
  currentValueStart: DateRangeValue | null;
  currentValueEnd: DateRangeValue | null;
  searchValue: DateRangeValue | null;
  focusedRange: RangeFocus;
  focusedInput?: DateRangeKeys;
}

export const YearPicker: FC<YearPickerProps> = ({
  onSelect,
  currentValueStart,
  currentValueEnd,
  searchValue,
  focusedRange,
  focusedInput,
}) => {
  const yearListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!searchValue) return;

    const yearList = yearListRef.current;

    if (!yearList) return;

    const selectedYear = yearList.querySelector('.border-BLUE_700');

    if (!selectedYear) return;

    selectedYear.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  }, [searchValue]);

  const yearsList = getYearList();

  const onSelectValue = ({ year }: MapAny) => {
    const value: DateRangeValue = {
      type: DATE_RANGE_TYPES.YEAR,
      year,
      value: getStartOfYear(year),
      label: year,
    };

    onSelect(value);
  };

  const isSelected = (year: number) => {
    return (
      (year === currentValueStart?.year && currentValueStart?.type === DATE_RANGE_TYPES.YEAR) ||
      (year === currentValueEnd?.year && currentValueEnd?.type === DATE_RANGE_TYPES.YEAR)
    );
  };

  const isPartiallySelected = (year: number) => {
    return searchValue && searchValue.year === year && searchValue.type === DATE_RANGE_TYPES.YEAR;
  };

  // ---------- Range selection-----------------
  const isRangeSelectionInProgress = focusedRange[1] === 1;

  const [lastHoveredValue, setLastHoveredValue] = useState<number | null>(null);

  const onMouseEnter = (year: number) => {
    if (!isRangeSelectionInProgress) return;

    setLastHoveredValue(year);
  };

  useEffect(() => {
    if (focusedRange[1] === 0) {
      setLastHoveredValue(null);
    }
  }, [focusedRange]);

  const shouldHighlightCell = (year: number) => {
    /** When range is already selected */
    if (currentValueEnd && currentValueStart && currentValueStart?.year !== currentValueEnd?.year) {
      if (currentValueStart?.type !== currentValueEnd?.type) return false;

      const minYear = Math.min(currentValueStart.year, currentValueEnd.year);
      const maxYear = Math.max(currentValueStart.year, currentValueEnd.year);

      return year > minYear && year < maxYear;
    }

    if (!lastHoveredValue) return false;

    /** When range selection is in progress */
    const currentValue = focusedInput === DateRangeKeys.START_DATE ? currentValueEnd : currentValueStart;

    if (!currentValue) return false;

    const minYear = Math.min(lastHoveredValue, currentValue?.year);
    const maxYear = Math.max(lastHoveredValue, currentValue?.year);

    if (year === lastHoveredValue) {
      return true;
    }

    if (year > minYear && year < maxYear) {
      return true;
    }

    return false;
  };

  return (
    <div className='flex flex-wrap gap-2' ref={yearListRef} onMouseLeave={() => setLastHoveredValue(null)}>
      {yearsList.map((year, index) => {
        return (
          <div
            key={index}
            className={` ${
              isSelected(year)
                ? 'bg-BLUE_700 border-DIVIDER_SAIL_2 text-white'
                : shouldHighlightCell(year)
                  ? 'bg-BLUE_100'
                  : isPartiallySelected(year)
                    ? 'border-BLUE_700'
                    : 'hover:border-BLUE_700 bg-BG_GRAY_2 border-GRAY_400'
            } f-12-500 mb-2.5 flex w-[calc(50%-8px)] cursor-pointer items-center justify-center rounded-sm border py-[4.5px]`}
            onClick={() => onSelectValue({ year })}
            onMouseEnter={() => onMouseEnter(year)}
          >
            {year}
          </div>
        );
      })}
    </div>
  );
};
