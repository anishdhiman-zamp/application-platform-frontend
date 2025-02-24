import { useMemo } from 'react';
import {
  CellDoubleClickedEvent,
  CellStyleModule,
  ClientSideRowModelModule,
  ColDef,
  ColGroupDef,
  ColumnApiModule,
  ColumnAutoSizeModule,
  ColumnMenuModule,
  ColumnsToolPanelModule,
  ContextMenuModule,
  FiltersToolPanelModule,
  GridStateModule,
  GroupCellRendererParams,
  ModuleRegistry,
  PivotModule,
  RowApiModule,
  RowGroupingPanelModule,
  RowStyleModule,
  ValidationModule,
} from 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';
import { PERIODICITY_TYPES } from 'constants/date.constants';
import { ROUTES_PATH } from 'constants/routeConfig';
import WidgetTitle from 'modules/widgets/components/widgetTitle';
import PivotCell from 'modules/widgets/Pivot/components/PivotCell';
import PivotColGroupHeader from 'modules/widgets/Pivot/components/PivotColGroupHeader';
import PivotRowTitle from 'modules/widgets/Pivot/components/PivotRowTitle';
import {
  COL_MIN_WIDTH,
  GRAND_ROW_TOTAL_POSITION,
  PINNED_COL_WIDTH,
  PINNED_DIRECTION,
  PIVOT_GRID_OPTIONS,
  PIVOT_GROUP_HEADER_HEIGHT,
  PIVOT_HEADER_HEIGHT,
  PIVOT_TABLE_THEME_PARAMS,
} from 'modules/widgets/Pivot/pivot.constants';
import { ColumnFilterConfig, ParentFilters, PivotContext } from 'modules/widgets/Pivot/pivot.types';
import {
  concatTagFilters,
  getColumnLevelFilters,
  getFilterContext,
  getPivotColDefs,
  getPivotColumns,
  getPivotData,
  getRowLevelFilters,
  getTopNode,
  getWidgetMappingDatasets,
} from 'modules/widgets/Pivot/pivot.utils';
import { useRouter } from 'next/navigation';
import { WIDGET_TYPES, WidgetDataResponseType, WidgetInstanceType } from 'types/api/widgets.types';
import { MapAny, OptionsType } from 'types/commonTypes';
import { myTheme } from 'components/common/table/table.constants';
import { getDataTableTheme } from 'components/common/table/table.utils';

ModuleRegistry.registerModules([CellStyleModule]);
ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  ColumnsToolPanelModule,
  ColumnMenuModule,
  ContextMenuModule,
  PivotModule,
  ColumnApiModule,
  FiltersToolPanelModule,
  RowGroupingPanelModule,
  CellStyleModule,
  RowStyleModule,
  RowApiModule,
  ValidationModule,
  GridStateModule,
  ColumnAutoSizeModule,
]);

type StackedPivotProps = {
  widgetInstanceDetails: Extract<WidgetInstanceType, { widget_type: WIDGET_TYPES.PIVOT_TABLE }>;
  widgetData: WidgetDataResponseType;
  groupWidgetsOptions: OptionsType[];
  onWidgetChange: (widgetId: string) => void;
  currentWidgetSelectedFilter: MapAny;
  periodicity: PERIODICITY_TYPES;
  activeWidget: string;
};

const StackedPivot = ({
  widgetInstanceDetails,
  widgetData,
  groupWidgetsOptions,
  onWidgetChange,
  currentWidgetSelectedFilter,
  periodicity,
  activeWidget,
}: StackedPivotProps) => {
  const router = useRouter();
  const customTheme = useMemo(() => getDataTableTheme({ ...PIVOT_TABLE_THEME_PARAMS, ...{} }), []);
  const { title, display_config } = widgetInstanceDetails;

  const { colDef, rowData, columnContextMapping } = useMemo(() => {
    const pivotCols = getPivotColumns(widgetInstanceDetails, widgetData);
    const { coldefs, columnContextMapping } = getPivotColDefs(pivotCols);

    return {
      colDef: coldefs,
      rowData: getPivotData(pivotCols, widgetData, periodicity),
      columnContextMapping,
    };
  }, [widgetInstanceDetails, widgetData, periodicity]);

  const pivotContext: PivotContext = useMemo(
    () => ({
      filterContext: getFilterContext(widgetInstanceDetails),
      widgetMappingDatasets: getWidgetMappingDatasets(widgetInstanceDetails),
      columnContextMapping,
    }),
    [widgetInstanceDetails, columnContextMapping],
  );

  const isSingleHeader = useMemo(() => colDef.filter((col) => 'aggFunc' in col).length === 1, [colDef]);

  const defaultColDef = useMemo<ColDef>(
    () => ({
      flex: 1,
      minWidth: COL_MIN_WIDTH,
      enableValue: true,
      enableRowGroup: true,
      enablePivot: true,
      resizable: false,
      cellRenderer: ({ valueFormatted, node, api, column }: GroupCellRendererParams) => {
        return (
          <PivotCell
            value={valueFormatted ?? ''}
            column={column}
            api={api}
            node={node}
            currency={widgetData?.currency}
            maxGroupingLevel={colDef?.filter((col) => col.rowGroup).length - 1}
            showPercentage={display_config?.show_percentages}
          />
        );
      },
    }),
    [widgetInstanceDetails, display_config, colDef, widgetData],
  );

  const autoGroupColumnDef = useMemo<ColDef>(
    () => ({
      minWidth: PINNED_COL_WIDTH,
      resizable: false,
      pinned: 'left',
      headerComponent: WidgetTitle,
      headerComponentParams: {
        title: title,
        isSingleHeader,
        groupWidgetsOptions,
        onWidgetChange,
        widgetType: WIDGET_TYPES.PIVOT_TABLE,
        activeWidget,
        isPortalNeeded: true,
      },
      cellRenderer: (props: GroupCellRendererParams) => {
        return (
          <PivotRowTitle
            node={props?.node}
            value={props?.value}
            maxGroupingLevel={colDef?.filter((col) => col?.rowGroup)?.length - 1}
            showIcons={display_config?.show_icons}
          />
        );
      },
      cellRendererParams: {
        suppressCount: true,
        suppressPadding: true,
      },
    }),
    [widgetInstanceDetails, isSingleHeader, colDef, groupWidgetsOptions, onWidgetChange, title, display_config],
  );

  const processPivotResultColGroupDef = useMemo(() => {
    return (colGroupDef: ColGroupDef) => {
      colGroupDef.headerGroupComponent = PivotColGroupHeader;
      colGroupDef.headerGroupComponentParams = {
        isSingleHeader,
      };
    };
  }, [isSingleHeader]);

  const navigateToDataset = (datasetId: string | null, filters: ParentFilters) => {
    const query = {
      ...currentWidgetSelectedFilter,
      ...filters,
    };
    const path = ROUTES_PATH.DATASET.replace(':datasetId', datasetId ?? '');

    router.push(`${path}?filters=${JSON.stringify(query)}`);
  };

  const handleDrilldown = (params: CellDoubleClickedEvent<MapAny[], PivotContext>) => {
    const { node, colDef: currentColDef } = params;

    if (node?.level === -1 || currentColDef?.pinned === PINNED_DIRECTION.LEFT) return;

    // extract the context from the params
    const context: PivotContext = params.context;

    // extract the current mapping ref from the colDef
    let currentRef = currentColDef?.context?.mappingName;

    // if there are more than one mappings, then the current ref is the top node
    if (Object.keys(context?.columnContextMapping).length > 1) {
      currentRef = getTopNode(node)?.key;
    }
    if (!currentRef) return;

    // extract the column filters for the current ref
    const currentRefColumnFilters: ColumnFilterConfig[] = context?.filterContext?.[currentRef];

    if (!currentRefColumnFilters) return;

    // extract the column context mapping for the current ref
    // this mapping holds the mapping of identifiers set in AGGrid against the column context (name, alias)
    const currentRefColumnContextMapping = context?.columnContextMapping[currentRef];

    if (!currentRefColumnContextMapping) return;

    // extract the row level filters for the currently clickedn ode
    const rowLevelFilters = getRowLevelFilters(currentRefColumnFilters, currentRefColumnContextMapping, node);

    // get the pivot columns that the current cell belongs to
    const pivotColumns = params.api.getPivotColumns().map((col) => col.getColDef());

    // get the column level filters for the current cell
    const columnLevelFilters = getColumnLevelFilters(
      currentRefColumnFilters,
      pivotColumns,
      currentRefColumnContextMapping,
      {
        periodicity,
        widgetSelectedFilter: currentWidgetSelectedFilter,
      },
      currentColDef.pivotKeys || [],
    );

    // merge the row level and column level filters
    const widgetFilter: ParentFilters = concatTagFilters({
      ...rowLevelFilters,
      ...columnLevelFilters,
    });

    // extract the dataset id from the context
    const datasetId = context?.widgetMappingDatasets?.[currentRef];

    if (!datasetId) return;

    // navigate to the dataset
    navigateToDataset(datasetId, widgetFilter);
  };

  return (
    <div className='h-fit w-full pivot'>
      <AgGridReact
        theme={customTheme ?? myTheme}
        domLayout='autoHeight'
        context={pivotContext}
        className='group'
        rowData={rowData}
        columnDefs={colDef}
        defaultColDef={defaultColDef}
        autoGroupColumnDef={autoGroupColumnDef}
        pivotHeaderHeight={isSingleHeader ? 0 : PIVOT_HEADER_HEIGHT}
        pivotGroupHeaderHeight={isSingleHeader ? 93 : PIVOT_GROUP_HEADER_HEIGHT}
        grandTotalRow={display_config?.show_column_aggregations ? GRAND_ROW_TOTAL_POSITION : undefined}
        processPivotResultColGroupDef={processPivotResultColGroupDef}
        onCellDoubleClicked={handleDrilldown}
        enableStrictPivotColumnOrder
        {...PIVOT_GRID_OPTIONS}
      />
    </div>
  );
};

export default StackedPivot;
