import React from 'react';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { MonthsConfig } from 'constants/date.constants';
import { ICON_SPRITE_TYPES } from 'constants/icons';
import { getYearList } from 'components/common/dateRangePicker/dateRangePicker.utils';

export const DateRangePickerNavigator = (
  currFocusedDate: Date,
  changeShownDate: (
    value: string | number | Date,
    mode?: 'set' | 'setYear' | 'setMonth' | 'monthOffset' | undefined,
  ) => void,
) => {
  const currentMonth = MonthsConfig[currFocusedDate.getMonth()].value;

  const yearsList = getYearList();

  return (
    <div className='flex justify-between'>
      <div className='border-DIVIDER_SAIL_2 flex w-fit border'>
        <select
          className='f-12-400 bg-BG_GRAY_2 focus:outline-hidden border-r-DIVIDER_SAIL_2 outline-hidden cursor-pointer appearance-none border border-y-0 border-l-0 px-2 py-1'
          value={currentMonth}
          onChange={(e) => changeShownDate(e.target.value, 'setMonth')}
        >
          {MonthsConfig.map((month) => (
            <option key={month.short} value={month.value}>
              {month.short}
            </option>
          ))}
        </select>

        <select
          className='f-12-400 bg-BG_GRAY_2 focus:outline-hidden outline-hidden cursor-pointer appearance-none border-none px-2 py-1'
          value={currFocusedDate?.getFullYear()}
          onChange={(e) => changeShownDate(e.target.value, 'setYear')}
        >
          {yearsList.map((year, index) => (
            <option key={index} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      <div className='flex'>
        <button className='text-DIVIDER_SAIL_4 mr-3' onClick={() => changeShownDate(-1, 'monthOffset')}>
          <SvgSpriteLoader id='chevron-left' iconCategory={ICON_SPRITE_TYPES.ARROWS} width={16} height={16} />
        </button>
        <button className='text-DIVIDER_SAIL_4' onClick={() => changeShownDate(1, 'monthOffset')}>
          <SvgSpriteLoader id='chevron-right' iconCategory={ICON_SPRITE_TYPES.ARROWS} width={16} height={16} />
        </button>
      </div>
    </div>
  );
};
