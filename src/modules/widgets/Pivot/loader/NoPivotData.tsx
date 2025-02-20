import { FC } from 'react';
import NoWidgetData from 'modules/widgets/components/NoWidgetData';
import WidgetTitle from 'modules/widgets/components/widgetTitle';
import { WIDGET_TYPES } from 'types/api/widgets.types';
import { OptionsType } from 'types/commonTypes';

interface NoPivotDataProps {
  groupWidgetsOptions: OptionsType[];
  onWidgetChange: (widgetId: string) => void;
  title: string;
}

const NoPivotData: FC<NoPivotDataProps> = ({ groupWidgetsOptions, onWidgetChange, title }) => {
  return (
    <div className='overflow-x-auto flex flex-col w-full h-full border border-GRAY_400 rounded-xl overflow-hidden group'>
      <div className='w-full h-[80px] border-b bg-red-500 border-GRAY_400'>
        <WidgetTitle
          groupWidgetsOptions={groupWidgetsOptions}
          onWidgetChange={onWidgetChange}
          title={title}
          widgetType={WIDGET_TYPES.PIVOT_TABLE}
        />
      </div>
      <div className='w-full h-full flex items-center justify-center z-0'>
        <NoWidgetData />
      </div>
    </div>
  );
};

export default NoPivotData;
