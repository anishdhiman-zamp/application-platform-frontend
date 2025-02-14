import { useRef, useState } from 'react';
import { useOnClickOutside } from 'hooks';
import { WIDGET_TYPES } from 'types/api/widgets.types';
import { OptionsType } from 'types/commonTypes';
import { cn } from 'utils/common';
import SvgSpriteLoader from 'components/SvgSpriteLoader';

interface WidgetTitleProps {
  title: string;
  groupWidgetsOptions: OptionsType[];
  onWidgetChange: (widgetId: string) => void;
  widgetType: WIDGET_TYPES;
}

const WidgetTitle = ({ title, groupWidgetsOptions, onWidgetChange, widgetType }: WidgetTitleProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isGroupWidget, setIsGroupWidget] = useState<boolean>(false);

  useOnClickOutside(ref, () => setIsGroupWidget(false));

  return (
    <div
      className={cn(
        'f-18-450 text-GRAY_1000 px-6 flex items-center gap-1 relative select-none',
        ![WIDGET_TYPES.DONUT_CHART, WIDGET_TYPES.PIE_CHART].includes(widgetType) ? 'mb-10' : '',
        groupWidgetsOptions?.length > 1 ? 'cursor-pointer' : '',
      )}
      onClick={() => setIsGroupWidget(!isGroupWidget)}
    >
      {title}
      {groupWidgetsOptions?.length > 1 && <SvgSpriteLoader id='chevron-down' width={16} height={16} />}
      {isGroupWidget && (
        <div
          ref={ref}
          className='absolute z-40 top-full left-5 bg-white flex flex-col gap-2 pt-2 pb-1 border border-GRAY_400 rounded-md shadow-tableFilterMenu max-h-[330px] w-[200px]'
        >
          <div className='flex flex-col h-full overflow-y-auto custom-scroll-bar-common px-1 select-none'>
            {groupWidgetsOptions?.map((option) => (
              <div
                key={option?.value}
                onClick={() => onWidgetChange(option?.value as string)}
                className='py-2 px-2.5 cursor-pointer select-none rounded hover:bg-GRAY_100'
              >
                {<div className='f-12-400 text-GRAY_1000'>{option?.label}</div>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WidgetTitle;
