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
import { useGetWidgetDataQuery } from 'apis/widgets';
import PivotAutoGroupHeader from 'modules/widgets/Pivot/components/PivotAutoGroupHeader';
import PivotCell from 'modules/widgets/Pivot/components/PivotCell';
import PivotColGroupHeader from 'modules/widgets/Pivot/components/PivotColGroupHeader';
import PivotRow from 'modules/widgets/Pivot/components/PivotRow';
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
  ValidationModule /* Development Only */,
]);

export type PivotTableWidgetProps = {
  widgetInstanceDetails: Extract<WidgetInstanceType, { widget_type: WIDGET_TYPES.PIVOT_TABLE }>;
  currentPageFilters: string;
  isFilterInitialized?: boolean;
};

export const PivotTableWidget = (props: PivotTableWidgetProps) => {
  const { widgetInstanceDetails, currentPageFilters, isFilterInitialized } = props;

  // fetch widget data
  const { data, isLoading, error } = useGetWidgetDataQuery(
    {
      widgetId: widgetInstanceDetails.widget_instance_id,
      payload: { filters: currentPageFilters },
    },
    {
      refetchOnMountOrArgChange: true,
      skip: !isFilterInitialized,
    },
  );

  // loading state: TODO
  if (isLoading) return <div />;

  // error state: TODO
  if (error || !data) return <div>Error</div>;

  return <StackedPivot {...props} widgetData={data} />;
};

type StackedPivotProps = {
  widgetInstanceDetails: Extract<WidgetInstanceType, { widget_type: WIDGET_TYPES.PIVOT_TABLE }>;
  widgetData: WidgetDataResponseType;
};

const StackedPivot = ({ widgetInstanceDetails, widgetData }: StackedPivotProps) => {
  // generate pivot columns, colDefs and rowData
  const { colDef, rowData } = useMemo(() => {
    const pivotColumns = getPivotColumns(widgetInstanceDetails, widgetData);

    const pivotColDefs = getPivotColDefs(pivotColumns);
    const rowData = getPivotData(pivotColumns, widgetData);

    return { colDef: pivotColDefs, rowData };
  }, [widgetInstanceDetails, widgetData]);

  // default colDef
  const defaultColDef = useMemo<ColDef>(() => {
    return {
      flex: 1,
      minWidth: 130,
      enableValue: true,
      enableRowGroup: true,
      enablePivot: true,
      cellRenderer: (props: GroupCellRendererParams) => {
        return <PivotCell value={props.valueFormatted || ''} />;
      },
    };
  }, []);

  // Auto-group column config for row grouping display
  const autoGroupColumnDef = useMemo<ColDef>(() => {
    return {
      minWidth: 360,
      pinned: 'left',
      headerComponent: PivotAutoGroupHeader,
      cellRenderer: (props: GroupCellRendererParams) => {
        return (
          <PivotRow
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
  }, [colDef]);

  // todo: remove any
  const getRowStyle = (params: any) =>
    getDynamicRowStyle(backendConfig.styleConfig.rowStyles, params.node.level, params.node.value);

  const processPivotResultColGroupDef = (colGroupDef: ColGroupDef) => {
    colGroupDef.headerGroupComponent = PivotColGroupHeader;
  };

  return (
    <div className='h-full w-full pivot'>
      <AgGridReact
        rowData={rowData}
        columnDefs={colDef}
        getRowStyle={getRowStyle}
        defaultColDef={defaultColDef}
        autoGroupColumnDef={autoGroupColumnDef}
        pivotMode={true}
        suppressContextMenu={true}
        suppressMenuHide={false}
        pivotHeaderHeight={64}
        pivotGroupHeaderHeight={42}
        rowHeight={42}
        processPivotResultColGroupDef={processPivotResultColGroupDef}
        suppressCellFocus
      />
    </div>
  );
};
