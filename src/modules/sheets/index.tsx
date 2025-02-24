import { useMemo, useState } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { useGetSheetDetailsQuery } from 'apis/pages';
import { ZAMP_LOADER } from 'constants/icons';
import { PAGE_CURRENCY_OPTIONS } from 'modules/page/pages.constants';
import InitializeSheetsFilters from 'modules/sheets/InitializeSheetsFilters';
import SingleSelectFilter from 'modules/widgets/components/SingleSelectFilter';
import WidgetSwitcher from 'modules/widgets/components/widgetSwitcher';
import { ROW_HEIGHT, SCREEN_BREAKPOINTS, WIDGETS_LAYOUT_MARGIN } from 'modules/widgets/widgets.constant';
import Image from 'next/image';
import CommonWrapper from 'components/commonWrapper';
import { SkeletonTypes } from 'components/commonWrapper/commonWrapper.types';
import FiltersWrapper from 'components/filter/filterMenu/FiltersWrapper';
import { useFiltersContextStore, withFiltersContext } from 'components/filter/filters.context';
import 'react-grid-layout/css/styles.css'; // Include default styles
import 'react-resizable/css/styles.css'; // Include resizable styles

interface SheetsProps {
  pageId: string;
  sheetId: string;
}

const ResponsiveGridLayout = WidthProvider(Responsive);

const Sheets = ({ pageId, sheetId }: SheetsProps) => {
  const {
    state: { filtersConfig, isFilterInitialized },
  } = useFiltersContextStore();
  const [currency, setCurrency] = useState<string[]>(['USD']);

  const {
    data: sheetDetails,
    isFetching: isSheetLoading,
    isError: isSheetDetailsError,
    refetch: refetchSheetDetails,
  } = useGetSheetDetailsQuery(
    { pageId: pageId as string, sheetId: sheetId as string },
    { skip: !pageId || !sheetId, refetchOnMountOrArgChange: false },
  );

  const sheetLayout = useMemo(() => {
    return sheetDetails?.sheet_config?.sheet_layout.map((widgetConfig) => {
      return {
        i: widgetConfig?.default_widget,
        ...widgetConfig?.layout,
      };
    });
  }, [sheetDetails?.sheet_config?.sheet_layout]);

  return (
    <InitializeSheetsFilters pageId={pageId} sheetId={sheetId}>
      <div className='relative'>
        <CommonWrapper
          isLoading={isSheetLoading}
          skeletonType={SkeletonTypes.CUSTOM}
          isError={isSheetDetailsError}
          refetchFunction={refetchSheetDetails}
          loader={
            <div className='flex justify-center items-center h-[calc(100vh-200px)] w-full z-1000 bg-white'>
              <Image unoptimized src={ZAMP_LOADER} alt='widget-loader' width={140} height={140} />
            </div>
          }
        >
          <div className='flex justify-between items-center z-100 px-5'>
            <div className='f-24-450 text-GRAY_950'>{sheetDetails?.name}</div>
            <div className='flex items-center gap-2'>
              <FiltersWrapper
                allowClear={false}
                label='Filter'
                className='px-0'
                allowActions={false}
                filterConfig={filtersConfig ?? []}
                isPeriodicityEnabled
              />
              {isFilterInitialized && currency && (
                <div className='flex items-center gap-2'>
                  <div className='border-r border-GRAY_400 h-7'></div>
                  <SingleSelectFilter
                    key='currency'
                    options={PAGE_CURRENCY_OPTIONS.filter((option) => option !== 'local')}
                    onFilterChange={(value) => setCurrency(value)}
                    value={currency}
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
              cols={{ lg: 16, md: 16, sm: 16, xs: 16 }}
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
                      currency={currency}
                      widgetInstances={sheetDetails?.widget_instances ?? []}
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
