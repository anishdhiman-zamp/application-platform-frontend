import { FC, useState } from 'react';
import { GROUP_COLLAPSE_ICON, GROUP_EXPAND_ICON } from 'constants/icons';
import WidgetTitle from 'modules/widgets/components/widgetTitle';
import Image from 'next/image';
import { WIDGET_TYPES } from 'types/api/widgets.types';
import { defaultFnType, OptionsType } from 'types/commonTypes';

interface PinnedColHeaderPropsType {
  title: string;
  groupWidgetsOptions: OptionsType[];
  onWidgetChange: (widgetId: string) => void;
  widgetType: WIDGET_TYPES;
  handleExpandAll: defaultFnType;
  handleCollapseAll: defaultFnType;
  activeWidget: string;
  isSingleValue?: boolean;
  className?: string;
  isPortalNeeded?: boolean;
}

const PinnedColHeader: FC<PinnedColHeaderPropsType> = ({
  title,
  groupWidgetsOptions,
  onWidgetChange,
  widgetType,
  activeWidget,
  className,
  isPortalNeeded = false,
  handleExpandAll,
  handleCollapseAll,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpansion = () => {
    setIsExpanded((prev) => !prev);
    if (!isExpanded) {
      handleExpandAll();
    } else {
      handleCollapseAll();
    }
  };

  return (
    <div className='bg-white w-full flex justify-between items-start h-full p-6 border-b-0.5 border-r-0.5 border-GRAY_400'>
      <WidgetTitle
        title={title}
        groupWidgetsOptions={groupWidgetsOptions}
        onWidgetChange={onWidgetChange}
        widgetType={widgetType}
        activeWidget={activeWidget}
        className={className}
        isPortalNeeded={isPortalNeeded}
      />
      <div
        className='flex items-center justify-center p-1.5 bg-BG_GRAY_2 rounded border border-GRAY_400 cursor-pointer'
        onClick={toggleExpansion}
      >
        <Image
          src={isExpanded ? GROUP_COLLAPSE_ICON : GROUP_EXPAND_ICON}
          alt='Group Expand Icon'
          height={14}
          width={14}
          priority
        />
      </div>
    </div>
  );
};

export default PinnedColHeader;
