import React, { useMemo } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { useGetSheetDetailsQuery } from 'apis/pages';
import { COLORS } from 'constants/colors';
import InitializeSheetsFilters from 'modules/sheets/InitializeSheetsFilters';
import { ROW_HEIGHT, SCREEN_BREAKPOINTS, WIDGETS_LAYOUT_MARGIN } from 'modules/widgets/widget.constant';
import WidgetsWrapper from 'modules/widgets/WidgetsWrapper';
import ProgressBar from 'components/common/RingProgress';
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
    state: { filtersConfig },
  } = useFiltersContextStore();
  const { data: sheetDetails, isLoading: isSheetLoading } = useGetSheetDetailsQuery(
    { pageId: pageId as string, sheetId: sheetId as string },
    { skip: !pageId || !sheetId, refetchOnMountOrArgChange: false },
  );

  const sheetLayout = useMemo(() => {
    return Object.keys(sheetDetails?.sheet_config?.sheet_layout ?? {}).map((key) => {
      return {
        i: key,
        ...sheetDetails?.sheet_config?.sheet_layout[key],
      };
    });

  }, [sheetDetails?.sheet_config?.sheet_layout]);


  return (
    <InitializeSheetsFilters pageId={pageId} sheetId={sheetId}>
      <div className='relative'>
        {isSheetLoading && (
          <div className='absolute top-0 right-0 h-[calc(100vh-200px)] w-full flex justify-center items-center z-1000 bg-white'>
            <ProgressBar
              trackColor={COLORS.BLACK}
              indicatorColor={COLORS.WHITE}
              indicatorWidth={10}
              trackWidth={5}
              className='animate-spin'
              size={100}
              progress={30}
            />
          </div>
        )}

        <div className='flex justify-between items-center z-100'>
          <div className='f-24-450 text-GRAY_950 mb-5.5'>{sheetDetails?.name}</div>
          <FiltersWrapper
            allowClear={false}
            label='Filter'
            className='px-0'
            allowActions={false}
            filterConfig={filtersConfig ?? []}
          />
        </div>

        {sheetDetails && (
          <ResponsiveGridLayout
            className='layout'
            layout={sheetLayout}
            cols={{ lg: 16, md: 16, sm: 16, xs: 12, xxs: 12 }}
            breakpoints={SCREEN_BREAKPOINTS}
            rowHeight={ROW_HEIGHT}
            width={1200} // Adjust grid width as per container
            margin={WIDGETS_LAYOUT_MARGIN}
            isResizable={false}
            isDraggable={false}
            useCSSTransforms={false}
          >
            {sheetDetails.widget_instances?.map((widget, idx) => (
              <div key={`widget-${idx}`} data-grid={sheetLayout[idx]} className='bg-white'>
                <WidgetsWrapper widgetDetails={widget} />
              </div>
            ))}
          </ResponsiveGridLayout>
        )}
      </div>
    </InitializeSheetsFilters>
  );
};

export default withFiltersContext(Sheets);
