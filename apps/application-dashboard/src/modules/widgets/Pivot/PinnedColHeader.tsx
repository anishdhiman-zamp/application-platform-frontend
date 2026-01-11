import { FC, useState } from 'react';
import { GROUP_COLLAPSE_ICON, GROUP_EXPAND_ICON } from 'constants/icons';
import WidgetTitle from 'modules/widgets/components/widgetTitle';
import Image from 'next/image';
import { WIDGET_TYPES } from 'types/api/widgets.types';
import { defaultFnType, OptionsType, SIDE_OPTIONS } from 'types/commonTypes';
import TooltipButton from 'components/common/button/TooltipButton';

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
  sheetId?: string;
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
  sheetId,
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
    <div className='border-b-0.5 border-r-0.5 border-GRAY_400 flex h-full w-full items-start justify-between bg-white p-6'>
      <WidgetTitle
        title={title}
        groupWidgetsOptions={groupWidgetsOptions}
        onWidgetChange={onWidgetChange}
        widgetType={widgetType}
        activeWidget={activeWidget}
        className={className}
        isPortalNeeded={isPortalNeeded}
        sheetId={sheetId}
      />

      <TooltipButton
        id='collapse-expand-all-btn'
        onClick={toggleExpansion}
        tooltipBody={isExpanded ? 'Collapse All' : 'Expand All'}
        buttonSize='xsmall'
        tooltipPosition={SIDE_OPTIONS.BOTTOM}
        className='!bg-BG_GRAY_2 rounded! p-1.5! text-xs!'
      >
        <Image alt='' src={isExpanded ? GROUP_COLLAPSE_ICON : GROUP_EXPAND_ICON} width={14} height={14} />
      </TooltipButton>
    </div>
  );
};

export default PinnedColHeader;
