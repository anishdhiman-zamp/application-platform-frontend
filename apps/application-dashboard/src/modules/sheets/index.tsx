'use client';
import { KeyboardEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { Button, toast } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { useGetPagesQuery, useUpdateSheetByPageIdMutation } from 'apis/pages';
import { ZAMP_LOGO_LOADER } from 'constants/lottie/zamp-logo-loader';
import { LOCAL_CURRENCY, PAGE_CURRENCY_OPTIONS } from 'modules/page/pages.constants';
import InitializeSheetsFilters from 'modules/sheets/InitializeSheetsFilters';
import SingleSelectFilter from 'modules/widgets/components/SingleSelectFilter';
import WidgetSwitcher from 'modules/widgets/components/widgetSwitcher';
import { ROW_HEIGHT, SCREEN_BREAKPOINTS, WIDGETS_LAYOUT_MARGIN } from 'modules/widgets/widgets.constant';
import { WIDGET_TYPES } from 'types/api/widgets.types';
import TooltipV2 from '@/components/common/TooltipV2';
import { KEYBOARD_KEYS } from '@/constants/shortcuts';
import { SIDE_OPTIONS } from '@/types/commonTypes';
import CommonWrapper from 'components/commonWrapper';
import { SkeletonTypes } from 'components/commonWrapper/commonWrapper.types';
import DynamicLottiePlayer from 'components/DynamicLottiePlayer';
import FiltersWrapper from 'components/filter/filterMenu/FiltersWrapper';
import { useFiltersContextStore, withFiltersContext } from 'components/filter/filters.context';
import 'react-grid-layout/css/styles.css'; // Include default styles
import 'react-resizable/css/styles.css'; // Include resizable styles

interface SheetsProps {
  pageId: string;
  sheetId: string;
  isPageLoading: boolean;
  isBff?: boolean;
}

const ResponsiveGridLayout = WidthProvider(Responsive);

const Sheets = ({ pageId, sheetId, isPageLoading, isBff }: SheetsProps) => {
  const {
    state: { filtersConfig, isFilterInitialized },
  } = useFiltersContextStore();
  const [currency, setCurrency] = useState<string[]>(['USD']);
  const [isEditingSheetName, setIsEditingSheetName] = useState(false);
  const [sheetName, setSheetName] = useState('');
  const [finalSheetName, setFinalSheetName] = useState<string>();
  const [inputWidth, setInputWidth] = useState(150);
  const spanRef = useRef<HTMLSpanElement>(null);
  const [updateSheetByPageId] = useUpdateSheetByPageIdMutation();

  const updateInputWidth = useCallback(() => {
    if (spanRef.current && sheetDetails?.name) {
      const spanWidth = spanRef.current.clientWidth;

      setInputWidth(spanWidth ? spanWidth + 20 : 184);
    }
  }, []);

  const [widgetDetails, setWidgetDetails] = useState<{
    height: number;
    isSingleHeader: boolean;
  }>({
    height: 0,
    isSingleHeader: true,
  });

  const handleWidgetHeightChange = (height: number, isSingleHeader: boolean) => {
    setWidgetDetails({
      height,
      isSingleHeader,
    });
  };

  const {
    data: pages,
    isLoading: isSheetLoading,
    isError: isSheetDetailsError,
    refetch: refetchSheetDetails,
  } = useGetPagesQuery(undefined, {
    refetchOnMountOrArgChange: false,
  });

  const sheetDetails = useMemo(() => {
    return pages?.find((page) => page.page_id === pageId)?.sheets?.find((sheet) => sheet.sheet_id === sheetId);
  }, [pages, pageId, sheetId]);

  //converts the pixel height from pivot-table into grid-layout height
  const getHfromWidgetHeight = (widgetHeight: number): number => {
    return (widgetHeight + 20) / 76;
  };

  const sheetLayout = useMemo(() => {
    return sheetDetails?.sheet_config?.sheet_layout?.map((widgetConfig) => {
      const widgetType = sheetDetails?.widget_instances?.find(
        (widget) => widget?.widget_instance_id === widgetConfig?.default_widget,
      )?.widget_type;

      return {
        i: widgetConfig?.default_widget,
        ...widgetConfig?.layout,
        h:
          widgetType === WIDGET_TYPES.PIVOT_TABLE && widgetDetails?.height > 0
            ? Math.min(getHfromWidgetHeight(widgetDetails?.height), widgetConfig?.layout?.h)
            : widgetConfig?.layout?.h,
      };
    });
  }, [sheetDetails?.sheet_config?.sheet_layout, widgetDetails, pageId, sheetId]);

  const handleInputBlur = () => {
    setIsEditingSheetName(false);
    const trimmedName = sheetName?.trim();

    if (trimmedName === sheetDetails?.name || !trimmedName) {
      setSheetName(sheetDetails?.name ?? '');

      return;
    }

    setFinalSheetName(trimmedName);

    updateSheetByPageId({
      pageId: pageId as string,
      sheetId: sheetId as string,
      body: {
        name: trimmedName,
      },
    })
      .unwrap()
      .then(() => {
        toast.success('Sheet name updated successfully');
      })
      .catch(() => {
        toast.error('Failed to update sheet name');
        setSheetName(sheetDetails?.name ?? '');
      });
  };

  const handleEditKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === KEYBOARD_KEYS.ENTER) {
      e.preventDefault();
      e.stopPropagation();
      handleInputBlur();
    }
  };

  //Add the max-height on pivot table based on sheet layout height for pivot and current actual height of the grid
  useEffect(() => {
    if (typeof document !== 'undefined' && sheetLayout) {
      if (sheetLayout && sheetDetails?.sheet_config?.sheet_layout[0]?.layout?.h == sheetLayout[0].h) {
        const substractedHeight = widgetDetails?.isSingleHeader ? 93 : 135;

        document.documentElement.style.setProperty(
          '--pivot-max-height',
          `${sheetLayout[0]?.h * 56 + (sheetLayout[0]?.h - 1) * 20 - substractedHeight}px`,
        );
      }
    }
  }, [sheetDetails, sheetLayout]);

  //To reset the widget details on switch of page or sheet
  useEffect(() => {
    setWidgetDetails({
      height: 0,
      isSingleHeader: true,
    });
  }, [pageId, sheetId]);

  useEffect(() => {
    if (sheetDetails) {
      const name = sheetDetails?.name ?? '';

      setSheetName(name);
      setFinalSheetName(name);
      setInputWidth(name.length * 15);
    }
  }, [sheetDetails]);

  useEffect(() => {
    updateInputWidth();
  }, [sheetName]);

  return (
    <InitializeSheetsFilters pageId={pageId} sheetId={sheetId}>
      <div className='relative h-[calc(100vh-94px)] overflow-scroll py-6 pr-0 pl-3'>
        <CommonWrapper
          isLoading={isSheetLoading || isPageLoading}
          skeletonType={SkeletonTypes.CUSTOM}
          isError={isSheetDetailsError}
          className='h-full'
          refetchFunction={refetchSheetDetails}
          loader={
            <div className='z-1000 flex h-full w-full items-center justify-center bg-white'>
              <DynamicLottiePlayer
                src={ZAMP_LOGO_LOADER}
                className='lottie-player h-[140px]'
                autoplay
                loop
                keepLastFrame
              />
            </div>
          }
        >
          <div className='z-100 flex items-center justify-between px-5'>
            {isEditingSheetName ? (
              <div className='relative inline-block'>
                <span ref={spanRef} className='f-24-450 invisible absolute whitespace-pre' aria-hidden='true'>
                  {sheetName}
                </span>
                <input
                  value={sheetName}
                  onChange={(e) => setSheetName(e.target.value)}
                  onBlur={handleInputBlur}
                  autoFocus
                  style={{ width: `${inputWidth}px` }}
                  className={cn('f-24-450 bg-GRAY_50 rounded-lg px-2.5 py-1 focus:outline-none', {
                    'bg-white': sheetName?.length === 0,
                  })}
                  placeholder='Add sheet title'
                  onKeyDown={handleEditKeyDown}
                />
              </div>
            ) : (
              <TooltipV2 tooltipBody='Rename' side={SIDE_OPTIONS.BOTTOM} asChildTrigger>
                <Button
                  variant='ghost'
                  className='text-GRAY_950 rounded-lg px-2.5 py-1'
                  onClick={() => setIsEditingSheetName(true)}
                >
                  <span className='f-24-450'>{finalSheetName || sheetDetails?.name}</span>
                </Button>
              </TooltipV2>
            )}
            <div className='flex items-center gap-2'>
              <FiltersWrapper
                allowClear={false}
                label='Filter'
                className='px-0'
                allowActions={false}
                filterConfig={filtersConfig ?? []}
                isPeriodicityEnabled
                isRightAligned
              />
              {isFilterInitialized && !sheetDetails?.sheet_config?.currency?.hide_currency_filter && currency && (
                <div className='flex items-center gap-2'>
                  {!!filtersConfig?.length && <div className='border-GRAY_400 h-7 border-r'></div>}
                  <SingleSelectFilter
                    filterKey='currency'
                    options={PAGE_CURRENCY_OPTIONS.filter((option) => option !== LOCAL_CURRENCY)}
                    onFilterChange={(value) => setCurrency(value)}
                    value={currency}
                    showColumnLabel={false}
                    label='Currency'
                  />
                </div>
              )}
            </div>
          </div>

          {sheetDetails && (
            <ResponsiveGridLayout
              className='layout'
              layout={sheetLayout}
              cols={{ lg: 16, md: 16, sm: 16, xs: 16, xxs: 16 }}
              breakpoints={SCREEN_BREAKPOINTS}
              rowHeight={ROW_HEIGHT}
              width={1200} // Adjust grid width as per container
              margin={WIDGETS_LAYOUT_MARGIN}
              isResizable={false}
              isDraggable={false}
              useCSSTransforms={false}
            >
              {sheetDetails?.sheet_config?.sheet_layout?.map((widgetConfig) => (
                <div
                  key={`widget-${widgetConfig?.default_widget}`}
                  data-grid={sheetLayout?.find((layout) => layout.i === widgetConfig?.default_widget)}
                  className='bg-white'
                >
                  <div key={widgetConfig?.default_widget} className='h-full w-full'>
                    <WidgetSwitcher
                      widgetConfig={widgetConfig}
                      currency={sheetDetails?.sheet_config?.currency?.hide_currency_filter ? [] : currency}
                      defaultCurrency={sheetDetails?.sheet_config?.currency?.default_currency}
                      widgetInstances={sheetDetails?.widget_instances ?? []}
                      handleWidgetHeightChange={handleWidgetHeightChange}
                      sheetId={sheetId}
                      isBff={isBff}
                    />
                  </div>
                </div>
              ))}
            </ResponsiveGridLayout>
          )}
        </CommonWrapper>
      </div>
    </InitializeSheetsFilters>
  );
};

export default withFiltersContext(Sheets);
