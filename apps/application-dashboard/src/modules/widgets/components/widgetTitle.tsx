import { MouseEvent, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { SelectButton } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { useOnClickOutside } from 'hooks';
import { WidgetOptionDropdown } from 'modules/widgets/components/WidgetOptionDropdown';
import { SIZE_OPTIONS_TITLE } from 'modules/widgets/create/constants';
import { ResizeProps, WidgetSize } from 'modules/widgets/widget.types';
import { getSheetIdFromPath } from 'modules/widgets/widgets.utils';
import { useParams, usePathname } from 'next/navigation';
import { WIDGET_TYPES } from 'types/api/widgets.types';
import { OptionsType } from 'types/commonTypes';
import { cn } from 'utils/common';
import { LOCAL_STORAGE_KEYS } from 'utils/localstorage';
import { FEATURE_FLAGS } from '@/constants/featureFlags';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';

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
  resizeProps?: ResizeProps;
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
  resizeProps,
}: WidgetTitleProps) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const [isGroupWidgetOptionsOpen, setIsGroupWidgetOptionsOpen] = useState(false);
  const [isSelfServePagesEnabled, setIsSelfServePagesEnabled] = useState(false);

  const { evaluate, ldClient } = useFeatureFlags();

  const isGroupWidgetOptions = groupWidgetsOptions?.length > 1;
  const isPivotTable = widgetType === WIDGET_TYPES.PIVOT_TABLE;

  // App Router hooks
  const params = useParams();
  const pathname = usePathname() || '';
  const id = params?.id as string | undefined;

  const currentSheetId = useMemo(() => getSheetIdFromPath(pathname ?? '', id ?? ''), [pathname, id]) ?? sheetId;

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

  useEffect(() => {
    if (ldClient) {
      evaluate(FEATURE_FLAGS.SELF_SERVE_PAGES)
        .then((res) => {
          setIsSelfServePagesEnabled(res);
        })
        .catch(() => {
          setIsSelfServePagesEnabled(false);
        });
    }
  }, [evaluate, ldClient]);

  return (
    <div className={className}>
      <div
        ref={titleRef}
        className={cn(
          'flex w-full cursor-pointer flex-col items-start px-6 select-none',
          ![WIDGET_TYPES.DONUT_CHART, WIDGET_TYPES.PIE_CHART].includes(widgetType) && 'mb-10',
          isPivotTable && isGroupWidgetOptions && 'mb-0 items-start justify-center gap-y-2 px-0',
          isPivotTable && !isGroupWidgetOptions && 'mb-0 cursor-default justify-center px-0',
          resizeProps && 'pr-2.5 pb-1',
        )}
        onClick={handleToggle}
      >
        <div className='flex w-full items-center justify-between'>
          <div className='flex items-center gap-1'>
            <span className={cn('f-18-450 text-GRAY_1000', resizeProps && 'mt-2')}>{title}</span>
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
          {resizeProps && isSelfServePagesEnabled && (
            <SelectButton
              options={SIZE_OPTIONS_TITLE}
              value={resizeProps.size}
              onValueChange={(value) => resizeProps.onSizeChange(value as WidgetSize)}
              buttonClassName='h-6 w-6'
              className='mb-1.5 p-0 opacity-0 group-hover:opacity-100'
            />
          )}
        </div>

        {isGroupWidgetOptions && (
          <span className='f-12-450 text-GRAY_700'>{`${groupWidgetsOptions?.length} Variants`}</span>
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
