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
import PivotAutoGroupHeader from 'modules/widgets/Pivot/components/PivotAutoGroupHeader';
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
};

const StackedPivot = ({ widgetInstanceDetails, widgetData }: StackedPivotProps) => {
  const isSingleValue = useMemo(() => {
    return (
      widgetInstanceDetails?.data_mappings.mappings?.length === 1 &&
      widgetInstanceDetails?.data_mappings?.mappings?.[0]?.fields?.values?.length === 1
    );
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
          />
        );
      },
    };
  }, []);

  const autoGroupColumnDef = useMemo<ColDef>(() => {
    return {
      minWidth: PINNED_COL_WIDTH,
      resizable: false,
      pinned: 'left',
      headerComponent: PivotAutoGroupHeader,
      headerComponentParams: {
        title: widgetInstanceDetails?.title,
        isSingleValue,
      },
      cellRenderer: (props: GroupCellRendererParams) => {
        return (
          <PivotRowTitle
            node={props.node}
            value={props.value}
            maxGroupingLevel={colDef?.filter((col) => col.rowGroup).length - 1}
          />
        );
      },
      cellRendererParams: {
        suppressCount: true,
        suppressPadding: true,
      },
    };
  }, [widgetInstanceDetails?.title, isSingleValue, colDef?.filter((col) => col.rowGroup).length]);

  const getRowStyle = (params: any) =>
    getDynamicRowStyle(backendConfig.styleConfig.rowStyles, params.node.level, params.node.value);

  const processPivotResultColGroupDef = (colGroupDef: ColGroupDef) => {
    colGroupDef.headerGroupComponent = PivotColGroupHeader;
    colGroupDef.headerGroupComponentParams = {
      isSingleValue,
    };
  };

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
          grandTotalRow={GRAND_ROW_TOTAL_POSITION}
          getRowId={(params) => params?.data?.id}
        />
      </div>
    </div>
  );
};

export default StackedPivot;
