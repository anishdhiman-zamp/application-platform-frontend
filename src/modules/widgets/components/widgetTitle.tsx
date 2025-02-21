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
  isSingleValue?: boolean;
  activeWidget: string;
}

const WidgetTitle = ({ title, groupWidgetsOptions, onWidgetChange, widgetType, activeWidget }: WidgetTitleProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isGroupWidget, setIsGroupWidget] = useState<boolean>(false);

  useOnClickOutside(ref, () => setIsGroupWidget(false));

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (groupWidgetsOptions?.length === 1) return;
    setIsGroupWidget((prev) => !prev);
  };

  const isPivotTable = [WIDGET_TYPES.PIVOT_TABLE].includes(widgetType);
  const isGroupWidgetOptions = groupWidgetsOptions?.length > 1;

  return (
    <div
      className={cn(
        isPivotTable
          ? 'bg-white w-full flex h-full p-6 border-b-0.5 border-b-GRAY_400 border-r-0.5 border-r-GRAY_400'
          : '',
      )}
    >
      <div
        className={cn(
          'px-6 flex flex-col items-start relative select-none cursor-pointer',
          ![WIDGET_TYPES.DONUT_CHART, WIDGET_TYPES.PIE_CHART].includes(widgetType) ? 'mb-10' : '',
          isPivotTable && !isGroupWidgetOptions ? 'mb-0 px-0 justify-center' : '',
          isPivotTable && isGroupWidgetOptions ? 'h-fit w-fit px-0 gap-y-2 items-start justify-center mb-0' : '',
        )}
        onClick={handleToggle}
      >
        <div className='flex items-center gap-1'>
          <span
            className={cn(
              'f-18-450 text-GRAY_1000 w-fit h-fit',
              isPivotTable && isGroupWidgetOptions
                ? 'group-hover:underline decoration-1 decoration-GRAY_500 underline-offset-[5px] '
                : '',
            )}
          >
            {title}
          </span>
          {isGroupWidgetOptions && (
            <SvgSpriteLoader
              id='chevron-down'
              width={18}
              height={18}
              className={
                isPivotTable ? 'transform transition-transform duration-200 opacity-0 group-hover:opacity-100' : ''
              }
            />
          )}
        </div>
        {isGroupWidgetOptions && (
          <span className='f-12-450 text-GRAY_700 w-fit opacity-0 group-hover:opacity-100 transition-opacity duration-200'>{`${groupWidgetsOptions?.length} Variants`}</span>
        )}
        {isGroupWidget && (
          <div
            ref={ref}
            className={cn(
              'absolute z-40 top-8 left-5 bg-white flex flex-col gap-2 pt-2 pb-1 border border-GRAY_400 rounded-md shadow-tableFilterMenu max-h-[330px] w-[200px]',
              isPivotTable ? 'left-0 top-8' : '',
            )}
          >
            <div className='flex flex-col h-full overflow-y-auto custom-scroll-bar-common px-1 select-none'>
              {groupWidgetsOptions?.map((option) => (
                <div
                  key={option?.value}
                  onClick={() => onWidgetChange(option?.value as string)}
                  className={cn('py-2 px-2.5 cursor-pointer select-none rounded hover:bg-GRAY_100', {
                    'bg-GRAY_100': activeWidget === option?.value,
                  })}
                >
                  {<div className='f-12-400 text-GRAY_1000'>{option?.label}</div>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WidgetTitle;
