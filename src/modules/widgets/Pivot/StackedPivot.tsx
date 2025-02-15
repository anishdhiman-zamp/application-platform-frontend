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
  GroupCellRendererParams,
  ModuleRegistry,
  PivotModule,
  RowApiModule,
  RowGroupingPanelModule,
  RowStyleModule,
  ValidationModule,
} from 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';
import WidgetTitle from 'modules/widgets/components/widgetTitle';
import PivotCell from 'modules/widgets/Pivot/components/PivotCell';
import PivotColGroupHeader from 'modules/widgets/Pivot/components/PivotColGroupHeader';
import PivotRowTitle from 'modules/widgets/Pivot/components/PivotRowTitle';
import {
  COL_MIN_WIDTH,
  GRAND_ROW_TOTAL_POSITION,
  PINNED_COL_WIDTH,
  PIVOT_GROUP_HEADER_HEIGHT,
  PIVOT_HEADER_HEIGHT,
  ROW_HEIGHT,
} from 'modules/widgets/Pivot/pivot.constants';
import {
  backendConfig,
  getDynamicRowStyle,
  getPivotColDefs,
  getPivotColumns,
  getPivotData,
} from 'modules/widgets/Pivot/pivot.utils';
import { WIDGET_TYPES, WidgetDataResponseType, WidgetInstanceType } from 'types/api/widgets.types';
import { OptionsType } from 'types/commonTypes';

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
]);

type StackedPivotProps = {
  widgetInstanceDetails: Extract<WidgetInstanceType, { widget_type: WIDGET_TYPES.PIVOT_TABLE }>;
  widgetData: WidgetDataResponseType;
  groupWidgetsOptions: OptionsType[];
  onWidgetChange: (widgetId: string) => void;
};

const StackedPivot = ({
  widgetInstanceDetails,
  widgetData,
  groupWidgetsOptions,
  onWidgetChange,
}: StackedPivotProps) => {
  const {
    data_mappings: { mappings },
    title,
    display_config,
  } = widgetInstanceDetails;

  const isSingleValue = useMemo(() => {
    return mappings?.length === 1 && mappings?.[0]?.fields?.values?.length === 1;
  }, [widgetInstanceDetails]);

  const { colDef, rowData } = useMemo(() => {
    const pivotColumns = getPivotColumns(widgetInstanceDetails, widgetData);

    const pivotColDefs = getPivotColDefs(pivotColumns);
    const rowData = getPivotData(pivotColumns, widgetData);

    return { colDef: pivotColDefs, rowData };
  }, [widgetInstanceDetails, widgetData]);

  const defaultColDef = useMemo<ColDef>(() => {
    return {
      flex: 1,
      minWidth: COL_MIN_WIDTH,
      enableValue: true,
      enableRowGroup: true,
      enablePivot: true,
      resizable: false,
      cellRenderer: ({ valueFormatted, node }: GroupCellRendererParams) => {
        return (
          <PivotCell
            value={valueFormatted ?? ''}
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

  return (
    <div className='h-full w-full'>
      <div className='h-full w-full pivot'>
        <AgGridReact
          rowData={rowData}
          columnDefs={colDef}
          getRowStyle={getRowStyle}
          defaultColDef={defaultColDef}
          autoGroupColumnDef={autoGroupColumnDef}
          pivotMode
          suppressContextMenu
          suppressMenuHide={false}
          pivotHeaderHeight={isSingleValue ? 0 : PIVOT_HEADER_HEIGHT}
          pivotGroupHeaderHeight={isSingleValue ? PIVOT_HEADER_HEIGHT : PIVOT_GROUP_HEADER_HEIGHT}
          rowHeight={ROW_HEIGHT}
          processPivotResultColGroupDef={processPivotResultColGroupDef}
          suppressRowHoverHighlight
          suppressCellFocus
          scrollbarWidth={12}
          grandTotalRow={display_config?.show_column_aggregations && GRAND_ROW_TOTAL_POSITION}
          getRowId={(params) => params?.data?.id}
        />
      </div>
    </div>
  );
};

export default StackedPivot;
