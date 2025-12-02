'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { Button, toast } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { useGetPagesQuery, useUpdateSheetByPageIdMutation } from 'apis/pages';
import { LOCAL_CURRENCY, PAGE_CURRENCY_OPTIONS } from 'modules/page/pages.constants';
import { PAGE_ACCESS_PRIVILEGES, ResourceType } from 'modules/shareResource';
import EditableHeader from 'modules/sheets/EditableHeader';
import EmptySheet from 'modules/sheets/EmptySheet';
import InitializeSheetsFilters from 'modules/sheets/InitializeSheetsFilters';
import { computeSheetLayout, getDatasetIdAndWidgetsMapping, getLastWidgetLayout } from 'modules/sheets/sheets.utils';
import useUpdateSheetLayout from 'modules/sheets/useUpdateSheetLauot';
import useWidgetResize from 'modules/sheets/useWidgetResize';
import SingleSelectFilter from 'modules/widgets/components/SingleSelectFilter';
import WidgetSwitcher from 'modules/widgets/components/widgetSwitcher';
import { WidgetSize } from 'modules/widgets/widget.types';
import { ROW_HEIGHT, SCREEN_BREAKPOINTS, WIDGETS_LAYOUT_MARGIN } from 'modules/widgets/widgets.constant';
import { useRouter } from 'next/navigation';
import ImageLoader from '@/components/common/loader/ImageLoader';
import { TOAST_MESSAGES } from '@/components/common/toast/toast.constants';
import PermissionGuard from '@/components/hoc/PermissionGuard';
import { ZAMP_LOGO_LOADER_SVG } from '@/constants/icons';
import useIsEditingBreadcrumbAllowed from '@/hooks/useIsEditingBreadcrumbAllowed';
import { ResponsiveGridLayoutType } from '@/types/commonTypes';
import CommonWrapper from 'components/commonWrapper';
import { SkeletonTypes } from 'components/commonWrapper/commonWrapper.types';
import FiltersWrapper from 'components/filter/filterMenu/FiltersWrapper';
import { filtersContextActions, useFiltersContextStore, withFiltersContext } from 'components/filter/filters.context';
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
  const router = useRouter();

  const {
    dispatch,
    state: { filtersConfig, isFilterInitialized },
  } = useFiltersContextStore();

  const [currency, setCurrency] = useState<string[]>(['USD']);
  const [updateSheetByPageId] = useUpdateSheetByPageIdMutation();
  const [sheetLayout, setSheetLayout] = useState<ResponsiveGridLayoutType[]>([]);

  const { handleDragStart, handleDragStop } = useUpdateSheetLayout({ setSheetLayout, pageId, sheetId });

  const isEditingSheetNameAllowed = useIsEditingBreadcrumbAllowed();

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

  const handleWidgetResize = useWidgetResize({ pageId, sheetId, setSheetLayout });

  //converts the pixel height from pivot-table into grid-layout height
  const getHfromWidgetHeight = useCallback((widgetHeight: number): number => {
    return (widgetHeight + 20) / 76;
  }, []);

  // Compute sheet layout with proper memoization
  const computedSheetLayout = useMemo(() => {
    return computeSheetLayout(sheetDetails, widgetDetails, getHfromWidgetHeight);
  }, [sheetDetails?.sheet_config?.sheet_layout, widgetDetails, pageId, sheetId, getHfromWidgetHeight]);

  const showCurrencyFilter = useMemo(() => {
    return (
      isFilterInitialized &&
      !sheetDetails?.sheet_config?.currency?.hide_currency_filter &&
      currency &&
      !!sheetLayout?.length
    );
  }, [isFilterInitialized, sheetDetails?.sheet_config?.currency?.hide_currency_filter, currency, sheetLayout]);

  const onSheetNameChange = (value: string) => {
    updateSheetByPageId({
      pageId: pageId as string,
      sheetId: sheetId as string,
      body: {
        name: value,
      },
    })
      .unwrap()
      .then(() => {
        toast.success(TOAST_MESSAGES.SUCCESS_SHEET_NAME_UPDATED);
      })
      .catch(() => {
        toast.error(TOAST_MESSAGES.ERROR_SHEET_NAME_UPDATE);
      });
  };

  const handleAddWidget = () => {
    const lastWidgetLayout = getLastWidgetLayout(sheetLayout);

    router.push(`?isWidget=true&layout=${JSON.stringify(lastWidgetLayout)}`);
  };

  const handleWidgetResizeWrapper = (widgetId: string, size: WidgetSize) => {
    handleWidgetResize({ widgetId, size, sheetLayout, sheetDetails });
  };

  useEffect(() => {
    // Only update local state when computed layout changes and local state is empty
    if (computedSheetLayout.length > 0) {
      setSheetLayout(computedSheetLayout);
    }
  }, [computedSheetLayout]);

  //Add the max-height on pivot table based on sheet layout height for pivot and current actual height of the grid
  useEffect(() => {
    if (typeof document !== 'undefined' && sheetLayout) {
      if (sheetLayout && sheetDetails?.sheet_config?.sheet_layout?.[0]?.layout?.h === sheetLayout[0]?.h) {
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
    dispatch({
      type: filtersContextActions.SET_DATASET_ID_AND_WIDGETS_MAPPING,
      payload: { datasetIdAndWidgetsMapping: getDatasetIdAndWidgetsMapping(sheetDetails) },
    });
  }, [dispatch, sheetDetails]);

  return (
    <InitializeSheetsFilters pageId={pageId} sheetId={sheetId}>
      <div className='relative py-6'>
        <CommonWrapper
          isLoading={isSheetLoading || isPageLoading}
          skeletonType={SkeletonTypes.CUSTOM}
          isError={isSheetDetailsError}
          className='h-full'
          refetchFunction={refetchSheetDetails}
          loader={<ImageLoader imageSrc={ZAMP_LOGO_LOADER_SVG} width={140} height={140} className='z-1000' />}
        >
          <div className='z-100 space-y-4 border-b px-8 pb-4'>
            <div className='flex items-center justify-between'>
              {isEditingSheetNameAllowed ? (
                <EditableHeader
                  id={sheetId}
                  initialValue={sheetDetails?.name}
                  placeholder='Add sheet title'
                  onChange={onSheetNameChange}
                />
              ) : (
                <span className='f-24-450'>{sheetDetails?.name}</span>
              )}
              <div className='flex items-center gap-2'>
                {showCurrencyFilter && (
                  <SingleSelectFilter
                    filterKey='currency'
                    options={PAGE_CURRENCY_OPTIONS.filter((option) => option !== LOCAL_CURRENCY)}
                    onFilterChange={(value) => setCurrency(value)}
                    value={currency}
                    showColumnLabel={false}
                    label='Currency'
                  />
                )}
                {!!sheetLayout?.length && (
                  <PermissionGuard
                    resourceType={ResourceType.PAGE}
                    resourceId={pageId}
                    privilege={PAGE_ACCESS_PRIVILEGES.ADMIN}
                  >
                    <Button
                      size='xsmall'
                      variant='secondary'
                      onClick={handleAddWidget}
                      data-testid={`${sheetId}-add-widget-btn`}
                      className='gap-1 [&_svg]:size-3.5'
                    >
                      <SvgSpriteLoader id='plus' size={14} />
                      Add a widget
                    </Button>
                  </PermissionGuard>
                )}
              </div>
            </div>
            {!!sheetLayout?.length && (
              <FiltersWrapper
                allowClear
                label='Filter'
                className='px-0'
                allowActions
                filterConfig={filtersConfig ?? []}
                isPeriodicityEnabled
                isRightAligned
                isSheetFilters
                persistId={sheetId}
              />
            )}
          </div>
          <CommonWrapper
            isNoData={!sheetLayout?.length}
            noDataBanner={<EmptySheet onAddWidget={handleAddWidget} />}
            className='h-[calc(100vh-200px)] overflow-x-hidden overflow-y-scroll px-3 pb-20 [&::-webkit-scrollbar]:hidden'
          >
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
                isDraggable
                draggableHandle='.widget-options-handle'
                useCSSTransforms={false}
                onDragStart={handleDragStart}
                onDragStop={handleDragStop}
              >
                {sheetDetails?.sheet_config?.sheet_layout?.map((widgetConfig) => {
                  const currentWidgetLayout = sheetLayout?.find((layout) => layout.i === widgetConfig?.default_widget);

                  return (
                    <div key={widgetConfig?.default_widget} data-grid={currentWidgetLayout} className='bg-white'>
                      <div key={widgetConfig?.default_widget} className='h-full w-full'>
                        <WidgetSwitcher
                          widgetConfig={widgetConfig}
                          currency={sheetDetails?.sheet_config?.currency?.hide_currency_filter ? [] : currency}
                          defaultCurrency={sheetDetails?.sheet_config?.currency?.default_currency}
                          widgetInstances={sheetDetails?.widget_instances ?? []}
                          handleWidgetHeightChange={handleWidgetHeightChange}
                          sheetId={sheetId}
                          isBff={isBff}
                          resizeProps={{
                            size:
                              sheetLayout?.find((layout) => layout.i === widgetConfig?.default_widget)?.w === 8
                                ? 'half'
                                : 'full',
                            onSizeChange: (size) => handleWidgetResizeWrapper(widgetConfig?.default_widget, size),
                          }}
                          currentWidgetLayout={currentWidgetLayout}
                        />
                      </div>
                    </div>
                  );
                })}
              </ResponsiveGridLayout>
            )}
          </CommonWrapper>
        </CommonWrapper>
      </div>
    </InitializeSheetsFilters>
  );
};

export default withFiltersContext(Sheets);
