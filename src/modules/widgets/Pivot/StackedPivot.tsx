import { useMemo } from 'react';
import {
  CellStyleModule,
  ClientSideRowModelModule,
  ColDef,
  ColGroupDef,
  ColumnApiModule,
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
  Theme,
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
  PIVOT_GROUP_HEADER_HEIGHT,
  PIVOT_HEADER_HEIGHT,
  PIVOT_REF,
  PIVOT_TABLE_THEME_PARAMS,
} from 'modules/widgets/Pivot/pivot.constants';
import { ParentFilters, ParentMappingDetail } from 'modules/widgets/Pivot/pivot.types';
import {
  backendConfig,
  buildTagFilter,
  generateParentFilters,
  getAllParentKeys,
  getColumnFilterWithPeriodicity,
  getDynamicRowStyle,
  getMappingDetails,
  getPivotColDefs,
  getPivotColumns,
  getPivotData,
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
]);

type StackedPivotProps = {
  widgetInstanceDetails: Extract<WidgetInstanceType, { widget_type: WIDGET_TYPES.PIVOT_TABLE }>;
  widgetData: WidgetDataResponseType;
  groupWidgetsOptions: OptionsType[];
  onWidgetChange: (widgetId: string) => void;
  currentWidgetSelectedFilter: MapAny;
  periodicity: PERIODICITY_TYPES;
};

const StackedPivot = ({
  widgetInstanceDetails,
  widgetData,
  groupWidgetsOptions,
  onWidgetChange,
  currentWidgetSelectedFilter,
  periodicity,
}: StackedPivotProps) => {
  const router = useRouter();

  const {
    data_mappings: { mappings },
    title,
    display_config,
  } = widgetInstanceDetails;

  const mappingStructure = useMemo(() => {
    const generateMappingStructure = (mappings: any[]) => {
      const mappingObject: Record<string, any> = {};

      mappings.forEach((mapping) => {
        const ref = mapping?.ref;
        const datasetId = mapping?.dataset_id;

        if (!mappingObject[ref]) {
          mappingObject[ref] = { datasetId };
        }

        const allFields = [
          ...(mapping?.fields?.columns || []),
          ...(mapping?.fields?.rows || []),
          ...(mapping?.fields?.values || []),
        ];

        allFields.forEach((field) => {
          mappingObject[ref][field?.column] = field;
        });
      });

      return mappingObject;
    };

    return generateMappingStructure(mappings);
  }, [mappings]);

  const allRefs = useMemo(() => {
    return mappings?.map((mapping) => mapping?.ref) || [];
  }, [mappings]);

  const isSingleValue = useMemo(() => {
    return mappings?.length === 1 && mappings?.[0]?.fields?.values?.length === 1;
  }, [widgetInstanceDetails]);

  const { colDef, rowData } = useMemo(() => {
    const pivotColumns = getPivotColumns(widgetInstanceDetails, widgetData);

    const pivotColDefs = getPivotColDefs(pivotColumns);
    const rowData = getPivotData(pivotColumns, widgetData, periodicity as PERIODICITY_TYPES);

    return { colDef: pivotColDefs, rowData };
  }, [widgetInstanceDetails, widgetData, periodicity]);

  const defaultColDef = useMemo<ColDef>(() => {
    return {
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
            maxGroupingLevel={colDef?.filter((col) => col.rowGroup).length - 1}
            showPercentage={display_config?.show_percentages}
          />
        );
      },
    };
  }, [widgetInstanceDetails, display_config, colDef]);

  const autoGroupColumnDef = useMemo<ColDef>(() => {
    return {
      minWidth: PINNED_COL_WIDTH,
      resizable: false,
      pinned: 'left',
      headerComponent: WidgetTitle,
      headerComponentParams: {
        title: title,
        isSingleValue,
        groupWidgetsOptions,
        onWidgetChange,
        widgetType: WIDGET_TYPES.PIVOT_TABLE,
      },
      cellRenderer: (props: GroupCellRendererParams) => {
        return (
          <PivotRowTitle
            node={props.node}
            value={props.value}
            maxGroupingLevel={colDef?.filter((col) => col.rowGroup).length - 1}
            showIcons={display_config?.show_icons}
          />
        );
      },
      cellRendererParams: {
        suppressCount: true,
        suppressPadding: true,
      },
    };
  }, [widgetInstanceDetails, isSingleValue, colDef]);

  const getRowStyle = useMemo(() => {
    return (params: any) =>
      getDynamicRowStyle(backendConfig.styleConfig.rowStyles, params.node.level, params.node.value);
  }, [backendConfig.styleConfig.rowStyles]);

  const processPivotResultColGroupDef = useMemo(() => {
    return (colGroupDef: ColGroupDef) => {
      colGroupDef.headerGroupComponent = PivotColGroupHeader;
      colGroupDef.headerGroupComponentParams = {
        isSingleValue,
      };
    };
  }, [isSingleValue]);

  const getRowDetails = (key: string) => {
    return rowData.find((row) => Object.values(row).includes(key)) || null;
  };

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

    const filteredRowData = getRowDetails(currentNodeKey);

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

  const customTheme = getDataTableTheme({ ...PIVOT_TABLE_THEME_PARAMS, ...{} });

  const theme = useMemo<Theme | 'legacy'>(() => {
    return customTheme ?? myTheme;
  }, [customTheme]);

  return (
    <div className='h-full w-full'>
      <div className='h-full w-full pivot'>
        <AgGridReact
          theme={theme}
          className='group'
          rowData={rowData}
          columnDefs={colDef}
          getRowStyle={getRowStyle}
          defaultColDef={defaultColDef}
          autoGroupColumnDef={autoGroupColumnDef}
          pivotMode
          suppressContextMenu
          suppressMenuHide={false}
          pivotHeaderHeight={isSingleValue ? 0 : PIVOT_HEADER_HEIGHT}
          pivotGroupHeaderHeight={isSingleValue ? 93 : PIVOT_GROUP_HEADER_HEIGHT}
          processPivotResultColGroupDef={processPivotResultColGroupDef}
          suppressRowDrag
          suppressMovableColumns
          suppressCellFocus
          scrollbarWidth={0}
          grandTotalRow={display_config?.show_column_aggregations ? GRAND_ROW_TOTAL_POSITION : undefined}
          onCellDoubleClicked={handleOnCellDoubleClicked}
        />
      </div>
    </div>
  );
};

export default StackedPivot;
