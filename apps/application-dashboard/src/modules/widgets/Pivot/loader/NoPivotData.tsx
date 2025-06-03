import { FC } from 'react';
import NoWidgetData from 'modules/widgets/components/NoWidgetData';
import WidgetTitle from 'modules/widgets/components/widgetTitle';
import { WIDGET_TYPES } from 'types/api/widgets.types';
import { OptionsType } from 'types/commonTypes';
import { cn } from '@/utils/common';

interface NoPivotDataProps {
  groupWidgetsOptions: OptionsType[];
  onWidgetChange: (widgetId: string) => void;
  title: string;
  activeWidget: string;
  className?: string;
}

const NoPivotData: FC<NoPivotDataProps> = ({ groupWidgetsOptions, onWidgetChange, title, activeWidget, className }) => {
  return (
    <div
      className={cn(
        'border-GRAY_400 group flex h-full w-full flex-col overflow-hidden overflow-x-auto rounded-xl border',
        className,
      )}
    >
      <div className='border-b-0.5 flex h-[110px] w-full items-start justify-between bg-white p-6'>
        <WidgetTitle
          groupWidgetsOptions={groupWidgetsOptions}
          onWidgetChange={onWidgetChange}
          title={title}
          widgetType={WIDGET_TYPES.PIVOT_TABLE}
          activeWidget={activeWidget}
        />
      </div>
      <div className='z-0 flex h-full w-full items-center justify-center'>
        <NoWidgetData />
      </div>
    </div>
  );
};

export default NoPivotData;
