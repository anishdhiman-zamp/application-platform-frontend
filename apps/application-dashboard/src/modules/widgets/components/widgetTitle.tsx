import { MouseEvent, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useOnClickOutside } from 'hooks';
import { WidgetOptionDropdown } from 'modules/widgets/components/WidgetOptionDropdown';
import { getSheetIdFromPath } from 'modules/widgets/widgets.utils';
import { useRouter } from 'next/router';
import { WIDGET_TYPES } from 'types/api/widgets.types';
import { OptionsType } from 'types/commonTypes';
import { cn } from 'utils/common';
import { LOCAL_STORAGE_KEYS } from 'utils/localstorage';
import SvgSpriteLoader from 'components/SvgSpriteLoader';

interface WidgetTitleProps {
  title: string;
  groupWidgetsOptions: OptionsType[];
  onWidgetChange: (widgetId: string) => void;
  widgetType: WIDGET_TYPES;
  isSingleValue?: boolean;
  activeWidget: string;
  className?: string;
  isPortalNeeded?: boolean;
  sheetId?: string;
}

const WidgetTitle = ({
  title,
  groupWidgetsOptions,
  onWidgetChange,
  widgetType,
  activeWidget,
  className,
  isPortalNeeded = false,
  sheetId,
}: WidgetTitleProps) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const [isGroupWidgetOptionsOpen, setIsGroupWidgetOptionsOpen] = useState(false);
  const isGroupWidgetOptions = groupWidgetsOptions?.length > 1;
  const isPivotTable = widgetType === WIDGET_TYPES.PIVOT_TABLE;
  const router = useRouter();
  const { id } = router.query;

  const currentSheetId = useMemo(() => getSheetIdFromPath(router.asPath, id as string), [router.asPath, id]) ?? sheetId;

  useOnClickOutside(dropdownRef, (event) => {
    if (titleRef?.current && titleRef.current.contains(event?.target as Node)) return;
    setIsGroupWidgetOptionsOpen(false);
  });

  const handleToggle = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!isGroupWidgetOptions) return;
    setIsGroupWidgetOptionsOpen((prev) => !prev);
  };

  const handleAddWidgetInstanceToLocalStorage = (widgetId: string) => {
    if (!currentSheetId || typeof currentSheetId !== 'string') return;

    const storedData = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.WIDGET_INSTANCE_ID) || '{}');

    storedData[currentSheetId] = {
      ...(storedData[currentSheetId] || {}),
      widget_instance_id: widgetId,
    };

    localStorage.setItem(LOCAL_STORAGE_KEYS.WIDGET_INSTANCE_ID, JSON.stringify(storedData));
  };

  const handleWidgetChange = (widgetId: string) => {
    onWidgetChange(widgetId);
    setIsGroupWidgetOptionsOpen(false);
    handleAddWidgetInstanceToLocalStorage(widgetId);
  };

  return (
    <div className={className}>
      <div
        ref={titleRef}
        className={cn(
          'px-6 flex flex-col items-start w-fit select-none cursor-pointer',
          ![WIDGET_TYPES.DONUT_CHART, WIDGET_TYPES.PIE_CHART].includes(widgetType) && 'mb-10',
          isPivotTable && isGroupWidgetOptions && 'px-0 gap-y-2 items-start justify-center mb-0',
          isPivotTable && !isGroupWidgetOptions && 'mb-0 px-0 justify-center cursor-default',
        )}
        onClick={handleToggle}
      >
        <div className='flex items-center gap-1'>
          <span className='f-18-450 text-GRAY_1000'>{title}</span>
          {isGroupWidgetOptions && (
            <SvgSpriteLoader
              id='chevron-down'
              width={18}
              height={18}
              className={cn(
                'text-GRAY_900 transition-transform duration-300',
                isGroupWidgetOptionsOpen ? 'rotate-180' : 'rotate-0',
              )}
            />
          )}
        </div>

        {isGroupWidgetOptions && (
          <span className='f-12-450 text-GRAY_700 opacity-0 group-hover:opacity-100 transition-opacity duration-200'>{`${groupWidgetsOptions?.length} Variants`}</span>
        )}
      </div>
      {isGroupWidgetOptionsOpen &&
        (isPivotTable && isPortalNeeded ? (
          createPortal(
            <WidgetOptionDropdown
              options={groupWidgetsOptions}
              onSelect={handleWidgetChange}
              activeWidget={activeWidget}
              className='top-14 left-5'
              dropdownRef={dropdownRef}
            />,
            document?.querySelector('.pivot') as HTMLElement,
          )
        ) : (
          <WidgetOptionDropdown
            options={groupWidgetsOptions}
            onSelect={handleWidgetChange}
            activeWidget={activeWidget}
            className='top-12 left-6'
            dropdownRef={dropdownRef}
          />
        ))}
    </div>
  );
};

export default WidgetTitle;
