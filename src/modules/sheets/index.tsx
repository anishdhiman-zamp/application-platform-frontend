import React, { useMemo } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { useGetSheetDetailsQuery } from 'apis/pages';
import { WIDGET_LOADER_2 } from 'constants/icons';
import InitializeSheetsFilters from 'modules/sheets/InitializeSheetsFilters';
import { ROW_HEIGHT, SCREEN_BREAKPOINTS, WIDGETS_LAYOUT_MARGIN } from 'modules/widgets/widgets.constant';
import WidgetsWrapper from 'modules/widgets/WidgetsWrapper';
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
        <CommonWrapper
          isLoading={isSheetLoading}
          skeletonType={SkeletonTypes.CUSTOM}
          loader={
            <div className='flex justify-center items-center h-[calc(100vh-200px)] w-full z-1000 bg-white'>
              <Image unoptimized src={WIDGET_LOADER_2} alt='widget-loader' width={400} height={400} />
            </div>
          }
        >
          <div className='flex justify-between items-center z-100 px-5'>
            <div className='f-24-450 text-GRAY_950 mb-2.5'>{sheetDetails?.name}</div>
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
                <div
                  key={`widget-${idx}`}
                  data-grid={sheetLayout.find((layout) => layout.i === widget.widget_instance_id)}
                  className='bg-white'
                >
                  <WidgetsWrapper widgetDetails={widget} />
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
