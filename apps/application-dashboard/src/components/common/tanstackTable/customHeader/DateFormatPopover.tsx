import { FC } from 'react';
import { Button, CSS_VARS } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { cn } from '@zamp-platform/ui/utils';
import { DATE_FORMATS, formatRelativeWithCustomLocale } from '@zamp-platform/utils';
import { format } from 'date-fns';
import { defaultFnType } from '@/types/commonTypes';
import { DateFormatOptions } from 'components/common/table/CustomHeader/customHeader.constants';

interface DateFormatPopoverProps {
  dateFormat?: string;
  handleDateFormatClose: defaultFnType;
  handleDateFormatChange: (value: string) => void;
}

const DateFormatPopover: FC<DateFormatPopoverProps> = ({
  dateFormat,
  handleDateFormatClose,
  handleDateFormatChange,
}) => (
  <div className='w-60 px-1 py-3'>
    <div className='mb-3.5 flex items-center gap-1.5 px-2'>
      <Button variant='ghost' size='icon' className='h-3.5 w-3.5 p-0 [&_svg]:size-3.5' onClick={handleDateFormatClose}>
        <SvgSpriteLoader id='arrow-narrow-left' size={14} color={CSS_VARS.GRAY_900} />
      </Button>
      <span className='f-13-500'>Date Format</span>
    </div>
    <div>
      {DateFormatOptions.map((option) => (
        <Button
          key={option.value}
          variant='ghost'
          size='medium'
          className={cn('w-full', {
            'bg-GRAY_100': dateFormat === option.value || (!dateFormat && option.value === DATE_FORMATS.ddMMMyyyy),
          })}
          onClick={() => handleDateFormatChange(option.value)}
        >
          <span className='f-12-500 w-[102px] text-left'>{option.label}</span>
          <span className='f-11-450 w-[102px] text-left text-gray-900'>
            {DATE_FORMATS.RELATIVE === option.value
              ? formatRelativeWithCustomLocale()
              : format(new Date(), option.value)}
          </span>
          <SvgSpriteLoader
            id='check'
            size={12}
            color={CSS_VARS.GRAY_900}
            className={cn('opacity-0', {
              'opacity-100': dateFormat === option.value || (!dateFormat && option.value === DATE_FORMATS.ddMMMyyyy),
            })}
          />
        </Button>
      ))}
    </div>
  </div>
);

export default DateFormatPopover;
