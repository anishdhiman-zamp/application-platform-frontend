import { useMemo } from 'react';
import {
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
  PIVOT_REF,
  PIVOT_TABLE_THEME_PARAMS,
} from 'modules/widgets/Pivot/pivot.constants';
import { ParentFilters, ParentMappingDetail } from 'modules/widgets/Pivot/pivot.types';
import {
  buildTagFilter,
  generateMappingStructure,
  generateParentFilters,
  getAllParentKeys,
  getColumnFilterWithPeriodicity,
  getMappingDetails,
  getPivotColDefs,
  getPivotColumns,
  getPivotData,
  getRowDetails,
  getTagDetails,
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
  const {
    data_mappings: { mappings },
    title,
    display_config,
  } = widgetInstanceDetails;

  const mappingStructure = useMemo(() => generateMappingStructure(mappings), [mappings]);
  const allRefs = useMemo(() => mappings.map((m) => m.ref), [mappings]);

  const { colDef, rowData } = useMemo(() => {
    const pivotCols = getPivotColumns(widgetInstanceDetails, widgetData);

    return {
      colDef: getPivotColDefs(pivotCols),
      rowData: getPivotData(pivotCols, widgetData),
    };
  }, [widgetInstanceDetails, widgetData, periodicity]);

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
        periodicity,
      };
    };
  }, [isSingleHeader, periodicity]);

  const navigateToDataset = (datasetId: string | null, filters: Record<string, any>) => {
    const query = {
      ...currentWidgetSelectedFilter,
      ...filters,
    };
    const path = ROUTES_PATH.DATASET.replace(':datasetId', datasetId ?? '');

    router.push(`${path}?filters=${JSON.stringify(query)}`);
  };

  const handleOnCellDoubleClicked = (params: any) => {
    const { node, colDef, api } = params;
    const currentNodeKey = node?.key;

    if (!currentNodeKey || node?.level === -1 || colDef?.pinned === PINNED_DIRECTION.LEFT) return;

    const filteredRowData = getRowDetails(currentNodeKey, rowData);

    if (!filteredRowData) return;

    const pivotCols = api?.getPivotColumns();
    const pivotColId = pivotCols?.[0]?.getColId();
    const pivotKey = colDef?.pivotKeys?.[0];

    const currentRowContext = node?.rowGroupColumn?.getColDef()?.context?.sourceName;
    const parentDetails = getAllParentKeys(node, filteredRowData);
    const isTopNode = node?.level === 0;
    const { isTag, tagColumnName } = getTagDetails(filteredRowData, currentNodeKey);

    const datasetId = mappingStructure?.[filteredRowData?.[PIVOT_REF]]?.datasetId;
    const columnMappingDetails = getMappingDetails(mappingStructure, filteredRowData?.[PIVOT_REF], pivotColId);
    const rowMappingDetails = getMappingDetails(
      mappingStructure,
      filteredRowData?.[PIVOT_REF],
      isTag ? tagColumnName : currentRowContext,
    );

    const parentMappingDetails: ParentMappingDetail[] = parentDetails.map(({ key, context, tag }) => ({
      key,
      tag,
      mappingDetails: getMappingDetails(
        mappingStructure,
        filteredRowData?.[PIVOT_REF],
        isTag ? tagColumnName : context,
      ),
    }));

    const parentFilters = generateParentFilters(parentMappingDetails, currentNodeKey, isTag);

    const columnFilterWithPeriodicity = getColumnFilterWithPeriodicity(
      columnMappingDetails,
      periodicity as PERIODICITY_TYPES,
      pivotKey,
      currentWidgetSelectedFilter,
    );

    if (allRefs?.includes(currentNodeKey)) {
      return navigateToDataset(datasetId, columnFilterWithPeriodicity);
    }

    if (isTag) {
      return navigateToDataset(
        datasetId,
        buildTagFilter(isTopNode, rowMappingDetails, currentNodeKey, parentFilters, columnFilterWithPeriodicity),
      );
    }

    const widgetFilter: ParentFilters = {
      [rowMappingDetails?.column ?? '']: {
        filterType: rowMappingDetails?.drilldown_filter_type,
        type: rowMappingDetails?.drilldown_filter_operator,
        values: [currentNodeKey],
      },
      ...parentFilters,
      ...columnFilterWithPeriodicity,
    };

    return navigateToDataset(datasetId, widgetFilter);
  };

  return (
    <div className='h-fit w-full pivot'>
      <AgGridReact
        theme={customTheme ?? myTheme}
        domLayout='autoHeight'
        className='group'
        rowData={rowData}
        columnDefs={colDef}
        defaultColDef={defaultColDef}
        autoGroupColumnDef={autoGroupColumnDef}
        pivotHeaderHeight={isSingleHeader ? 0 : PIVOT_HEADER_HEIGHT}
        pivotGroupHeaderHeight={isSingleHeader ? 93 : PIVOT_GROUP_HEADER_HEIGHT}
        grandTotalRow={display_config?.show_column_aggregations ? GRAND_ROW_TOTAL_POSITION : undefined}
        processPivotResultColGroupDef={processPivotResultColGroupDef}
        onCellDoubleClicked={handleOnCellDoubleClicked}
        {...PIVOT_GRID_OPTIONS}
      />
    </div>
  );
};

export default StackedPivot;
