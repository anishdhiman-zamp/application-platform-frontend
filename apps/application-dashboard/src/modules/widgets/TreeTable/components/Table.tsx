import { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  CellDoubleClickedEvent,
  CellStyleModule,
  ClientSideRowModelApiModule,
  ClientSideRowModelModule,
  ColDef,
  ColumnApiModule,
  ColumnAutoSizeModule,
  ColumnMenuModule,
  ContextMenuModule,
  CsvExportModule,
  GridApi,
  GridStateModule,
  GroupCellRendererParams,
  ICellRendererParams,
  ModuleRegistry,
  RenderApiModule,
  RowApiModule,
  RowGroupingModule,
  RowStyleModule,
  ScrollApiModule,
  TreeDataModule,
  ValidationModule,
} from 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';
import { getDatasetRouteById } from 'constants/routeConfig';
import PivotColGroupHeader from 'modules/widgets/Pivot/components/PivotColGroupHeader';
import PivotConfigDropdown from 'modules/widgets/Pivot/components/PivotConfigDropdown';
import PivotRowTitle from 'modules/widgets/Pivot/components/PivotRowTitle';
import PinnedColHeader from 'modules/widgets/Pivot/PinnedColHeader';
import { PIVOT_REF, PIVOT_TABLE_THEME_PARAMS } from 'modules/widgets/Pivot/pivot.constants';
import { ParentFilters, PivotContext } from 'modules/widgets/Pivot/pivot.types';
import { concatTagFilters } from 'modules/widgets/Pivot/pivot.utils';
import TreeCell from 'modules/widgets/TreeTable/components/Cell';
import {
  COL_MIN_WIDTH,
  GRAND_ROW_TOTAL_POSITION,
  PINNED_COL_WIDTH,
  PINNED_DIRECTION,
  PIVOT_GROUP_HEADER_HEIGHT,
  PIVOT_HEADER_HEIGHT,
  ROW_HEIGHT,
} from 'modules/widgets/TreeTable/constants';
import { TableInterface } from 'modules/widgets/TreeTable/types';
import {
  extractKey,
  getColDefs,
  getColumnLevelFilters,
  getFilterContext,
  getTransformedTreeData,
} from 'modules/widgets/TreeTable/utils';
import { getDefaultFilterByDatasetId } from 'modules/widgets/widgets.utils';
import { useRouter } from 'next/navigation';
import { WIDGET_TYPES } from 'types/api/widgets.types';
import { getDataTableTheme } from 'components/common/table/table.utils';

ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  ColumnMenuModule,
  ContextMenuModule,
  ScrollApiModule,
  RenderApiModule,
  ColumnApiModule,
  RowApiModule,
  RowStyleModule,
  ValidationModule,
  GridStateModule,
  ColumnAutoSizeModule,
  CsvExportModule,
  CellStyleModule,
  TreeDataModule,
  ClientSideRowModelApiModule,
  RowGroupingModule,
]);

interface TreeNodeData {
  path: Array<{
    value: string;
    key: string;
  }>;
  data_keys: { column: string; key: string }[];
}

const TreeTableComponent = ({
  widgetInstanceDetails,
  widgetData,
  groupWidgetsOptions,
  onWidgetChange,
  currentWidgetSelectedFilter,
  periodicity,
  activeWidget,
  handleWidgetHeightChange,
  defaultCurrency,
}: TableInterface) => {
  const router = useRouter();
  const gridApi = useRef<GridApi | null>(null);
  const customTheme = useMemo(() => getDataTableTheme({ ...PIVOT_TABLE_THEME_PARAMS, ...{} }), []);
  const { title, display_config } = widgetInstanceDetails;
  const gridContainerRef = useRef<HTMLDivElement>(null);

  const handleExportAgGridData = () => {
    gridApi.current?.exportDataAsCsv({ fileName: title, allColumns: true });
  };

  const handleExpandAll = useCallback(() => {
    if (gridApi.current) {
      gridApi.current?.expandAll();
    }
  }, []);

  const handleCollapseAll = useCallback(() => {
    if (gridApi.current) {
      gridApi.current?.collapseAll();
    }
  }, []);

  const { colDef, rowData, mappingDatasets } = useMemo(() => {
    const transformWidgetData = getTransformedTreeData(widgetData, periodicity, widgetInstanceDetails);
    const coldefs = getColDefs(transformWidgetData.columnsHeaders, defaultCurrency ?? widgetData?.currency);
    const treeData = transformWidgetData.transformedData;
    const mappingDatasets = transformWidgetData.mappingDatasets;
    const pathColumns = transformWidgetData.pathColumns;

    return {
      colDef: coldefs,
      rowData: treeData,
      mappingDatasets,
      pathColumns,
    };
  }, [widgetInstanceDetails, widgetData, periodicity]);

  const isSingleHeader = useMemo(() => colDef.filter((col) => 'aggFunc' in col).length === 1, [colDef]);

  const defaultColDef = useMemo<ColDef>(
    () => ({
      flex: 1,
      minWidth: COL_MIN_WIDTH,
      enableValue: true,
      resizable: false,
      sortable: false,
      suppressMenu: true,
      headerComponent: PivotColGroupHeader,
      headerComponentParams: {
        isSingleHeader: true,
      },
      cellRenderer: ({ value, node, api, column }: ICellRendererParams) => {
        return (
          <TreeCell
            value={value ?? ''}
            column={column}
            api={api}
            node={node}
            currency={defaultCurrency ?? widgetData?.currency}
            showPercentage={display_config?.show_percentages}
          />
        );
      },
    }),
    [widgetInstanceDetails, display_config, widgetData],
  );

  const autoGroupColumnDef = useMemo<ColDef>(
    () => ({
      minWidth: PINNED_COL_WIDTH,
      resizable: false,
      pinned: 'left',
      lockPinned: true,
      lockPosition: 'left',
      headerComponent: PinnedColHeader,
      suppressMovable: true,
      headerComponentParams: {
        title,
        isSingleHeader,
        groupWidgetsOptions,
        onWidgetChange,
        widgetType: WIDGET_TYPES.PIVOT_TABLE,
        activeWidget,
        isPortalNeeded: true,
        handleCollapseAll,
        handleExpandAll,
      },
      cellRenderer: (props: GroupCellRendererParams) => {
        return <PivotRowTitle node={props?.node} value={props?.value} displayConfig={display_config} />;
      },
      cellRendererParams: {
        suppressCount: true,
        suppressPadding: true,
      },
    }),
    [
      widgetInstanceDetails,
      colDef,
      groupWidgetsOptions,
      onWidgetChange,
      title,
      display_config,
      activeWidget,
      handleExportAgGridData,
      handleCollapseAll,
      handleExpandAll,
    ],
  );

  const tableContext = useMemo(
    () => ({
      filterContext: getFilterContext(widgetInstanceDetails),
    }),
    [widgetInstanceDetails],
  );

  const mergeFilters = (currentFilters: ParentFilters, defaultFilters: ParentFilters) => {
    const mergedFilters: ParentFilters = {};

    Object.keys({ ...currentFilters, ...defaultFilters }).forEach((key) => {
      const currentValues = currentFilters[key]?.values || [];
      const defaultValues = defaultFilters[key]?.values || [];

      if (currentFilters[key] && defaultFilters[key]) {
        mergedFilters[key] = {
          ...currentFilters[key],
          values: currentValues.filter((value: string) => defaultValues.includes(value)),
        };
      } else {
        mergedFilters[key] = currentFilters[key] || defaultFilters[key];
      }
    });

    return mergedFilters;
  };

  const navigateToDataset = (datasetId: string | null, filters: ParentFilters) => {
    const defaultFilters = getDefaultFilterByDatasetId(widgetInstanceDetails?.data_mappings?.mappings, datasetId ?? '');

    const query = {
      ...mergeFilters(currentWidgetSelectedFilter, defaultFilters),
      ...filters,
    };

    const path = getDatasetRouteById(datasetId ?? '');

    router.push(`${path}?filters=${JSON.stringify(query)}`);
  };

  const handleDrilldown = (params: CellDoubleClickedEvent<TreeNodeData, PivotContext>) => {
    const { node, colDef: currentColDef } = params;

    if (node?.level === -1 || currentColDef?.pinned === PINNED_DIRECTION.LEFT) return;

    // Get the ref from the original data
    const ref = node.data?.path[0].value || (node.allLeafChildren?.[0].data?.path[0].value as string);
    const currentRefContext = tableContext.filterContext[ref];
    const treeFilters: ParentFilters = {};

    let selectedNodeData;

    // For leaf nodes, we have the full path data
    if (node.data?.path) {
      selectedNodeData = node.data;
      selectedNodeData.path
        .filter((item: { key: string }) => item.key !== PIVOT_REF)
        .forEach((item: { value: string; key: string }) => {
          const key = extractKey(item.key);
          const currentFilterContextValue = currentRefContext[key];

          treeFilters[item.key] = {
            filterType: currentFilterContextValue.filterType,
            type: currentFilterContextValue.type,
            values: [item.value],
            column: item.key,
          };
        });
    }
    // For non-leaf nodes (including top-level and intermediate nodes)
    else if (node.level !== undefined && node.level !== 0) {
      // Get the path data from the first leaf node under this group
      const firstLeafNode = node.allLeafChildren?.[0];

      if (firstLeafNode?.data?.path) {
        // Start from current level and go up to root
        selectedNodeData = firstLeafNode.data;
        for (let i = node.level; i >= 0; i--) {
          const levelData = selectedNodeData.path[i];

          const key = extractKey(levelData.key);

          if (key) {
            const currentFilterContextValue = currentRefContext[key];

            treeFilters[levelData.key] = {
              filterType: currentFilterContextValue.filterType,
              type: currentFilterContextValue.type,
              values: [levelData.value],
              column: levelData.key,
            };
            break; // Stop once we find a matching field
          }
        }
      }
    } else if (node.level === 0) {
      selectedNodeData = node.allLeafChildren?.[0].data;
    }
    if (!selectedNodeData || !currentColDef?.field) return;
    const columnLevelFilters = getColumnLevelFilters(
      currentRefContext,
      {
        periodicity,
        widgetSelectedFilter: currentWidgetSelectedFilter,
      },
      selectedNodeData.data_keys,
      currentColDef.field,
    );

    const widgetFilter = concatTagFilters({
      ...treeFilters,
      ...columnLevelFilters,
    });

    if (!mappingDatasets[ref]) return;

    navigateToDataset(mappingDatasets[ref], widgetFilter);
  };

  const handleScrollToRightEnd = () => {
    if (gridApi?.current) {
      const allColumns = gridApi.current?.getDisplayedCenterColumns();

      if (allColumns?.length > 0) {
        const lastColumn = allColumns[allColumns?.length - 1];

        gridApi.current?.ensureColumnVisible(lastColumn, 'auto');
      }
    }
  };

  const onGridReady = useCallback((params: { api: GridApi }) => {
    gridApi.current = params.api;

    setTimeout(() => {
      handleScrollToRightEnd();
    }, 0);
  }, []);

  useEffect(() => {
    const observer = new ResizeObserver(() => {
      if (gridContainerRef?.current) {
        handleWidgetHeightChange(gridContainerRef.current.clientHeight, isSingleHeader);
      }
    });

    if (gridContainerRef?.current) {
      observer.observe(gridContainerRef?.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className='h-fit w-full relative pivot tree-table group' ref={gridContainerRef}>
      <PivotConfigDropdown handleExportAgGridData={handleExportAgGridData} />
      <AgGridReact
        onGridReady={onGridReady}
        theme={customTheme}
        domLayout='autoHeight'
        rowData={rowData}
        columnDefs={colDef}
        defaultColDef={defaultColDef}
        autoGroupColumnDef={autoGroupColumnDef}
        treeData={true}
        context={tableContext}
        groupDefaultExpanded={0}
        onCellDoubleClicked={handleDrilldown}
        suppressAutoSize={true}
        getDataPath={(data) => data.path.map((level: { value: string }) => level.value)}
        suppressContextMenu={true}
        suppressMenuHide={false}
        suppressRowDrag={true}
        suppressMovableColumns={true}
        suppressCellFocus={true}
        maintainColumnOrder={true}
        suppressDragLeaveHidesColumns={true}
        groupMaintainOrder={true}
        scrollbarWidth={0}
        animateRows={false}
        suppressGroupRowsSticky={true}
        suppressStickyTotalRow={true}
        suppressHeaderFocus={true}
        suppressAggFuncInHeader={true}
        suppressRowTransform={true}
        autoSizeStrategy={{
          type: 'fitGridWidth',
        }}
        headerHeight={PIVOT_HEADER_HEIGHT}
        groupHeaderHeight={PIVOT_GROUP_HEADER_HEIGHT}
        rowHeight={ROW_HEIGHT}
        grandTotalRow={GRAND_ROW_TOTAL_POSITION}
      />
    </div>
  );
};

export default TreeTableComponent;
