'use client';

import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { captureException } from '@sentry/browser';
import { useResource } from '@zamp-platform/battalion';
import {
  BluePrintDataset,
  convertFilterConfigToColumns,
  DATASET_COLUMN_TYPES_LIST,
  type DatasetColumnDependencies,
  DatasetColumnProvider,
  DatasetColumnTypes,
  DatasetEditPreviewTab,
  DatasetTabsTypes,
  deleteColumnConfigForDataset,
  getColumnConfigForDataset,
  setColumnConfigForDataset,
  snakeCaseToDisplayName,
  useCheckDatasetCreationEnabled,
  useDatasetColumnContext,
  useDatasetGridSync,
} from '@zamp-platform/dataset-create-edit';
import {
  CellEditRequestEvent,
  ColDef,
  ColumnVisibleEvent,
  FillEndEvent,
  IServerSideDatasource,
  IServerSideGetRowsParams,
  IServerSideGetRowsRequest,
} from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { useGetDatasetDisplayConfigQuery, useUpdateDatasetMutation } from 'apis/admin';
import { useGetDatasetFilterConfigQuery, useLazyGetDatasetDataQuery, useUpdateDatasetDataMutation } from 'apis/dataset';
import { useOnClickOutside } from 'hooks';
import DatasetHistory from 'modules/data/components/datasetHistory/index';
import ExportDataset from 'modules/data/components/exportDataset';
import ImportDataset from 'modules/data/components/importDataset/index';
import TableSchemaAlignmentStatus from 'modules/data/components/importDataset/TableSchemaAlignmentStatus';
import { ColumnType, DatasetActionMessages, NEW_COLUMN_PREFIX, SourceType } from 'modules/data/data.constants';
import { DATASET_ACTION_TYPE, LOADER_STATUS, RuleColumnDetailsType } from 'modules/data/data.types';
import {
  formatColumns,
  formatDrilldownFilters,
  formatUrlFilters,
  getColumnOrderingVisibilityForCurrentDataset,
  getFilters,
  handleDrilldownClick,
  mergeAndOrderItems,
  mergeBackendAndFrontendColumns,
  removeCellFocus,
  syncSingleDatasetToLocalStorage,
} from 'modules/data/data.utils';
import { useAgGridContextSync } from 'modules/data/hooks/useAgGridContextSync';
import { useDatasetSSE } from 'modules/data/hooks/useDatasetSSE';
import RowPropertiesSideDrawer from 'modules/data/RowProperties';
import RulesListingSideDrawer from 'modules/data/RulesListing';
import RuleDelete from 'modules/data/RulesListing/RuleDelete';
import { LOCAL_CURRENCY, PAGE_CURRENCY_OPTIONS } from 'modules/page/pages.constants';
import { DATASET_ACCESS_PRIVILEGES, ResourceType } from 'modules/shareResource/shareResource.types';
import SingleSelectFilter from 'modules/widgets/components/SingleSelectFilter';
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation';
import { DatasetDataResponseType } from 'types/api/dataset.types';
import { MapAny } from 'types/commonTypes';
import { FilterModelType, LogicalOperatorType } from 'types/components/table.type';
import { checkIsObjectEmpty, cn, snakeCaseToSentenceCase } from 'utils/common';
import { getFromLocalStorage, LOCAL_STORAGE_KEYS, setToLocalStorage } from 'utils/localstorage';
import type { Dataset } from '@/app/(authenticated)/resources';
import ImageLoader from '@/components/common/loader/ImageLoader';
import { ZAMP_LOGO_LOADER_SVG } from '@/constants/icons';
import { usePendingDatasetContext } from '@/context/pendingDataset.context';
import { useResourceAccess } from '@/hooks/useResourceAccess';
import useIsDatasetCreationEnabled from '@/modules/process/hooks/useIsDatasetCreationEnabled';
import CustomHeader from 'components/common/table/CustomHeader';
import DatasetTable from 'components/common/table/DatasetTable';
import DisplayOptions from 'components/common/table/DisplayOptions';
import { getColumnType, getEncodedRequest } from 'components/common/table/table.utils';
import { toast } from 'components/common/toast/Toast';
import CommonWrapper from 'components/commonWrapper';
import { SkeletonTypes } from 'components/commonWrapper/commonWrapper.types';
import FiltersWrapper from 'components/filter/filterMenu/FiltersWrapper';
import { CONDITION_OPERATOR_TYPE } from 'components/filter/filters.constants';
import { filtersContextActions, useFiltersContextStore, withFiltersContext } from 'components/filter/filters.context';

type DatasetByIdProps = {
  id: string;
  drilldownFilters?: FilterModelType;
  isDrilldown?: boolean;
  pageSize?: number;
  isReadOnly?: boolean;
  containerStyle?: MapAny;
  gridStyle?: MapAny;
  updateDatasetTitleInParent?: (title: string) => void;
  updateFiltersInParent?: (filters: MapAny) => void;
  updateFilterConfigInParent?: (filterConfig: MapAny[]) => void;
  parentSelectedFilters?: MapAny;
  /** When true, skip API calls for filter-config, data, display-config (optimistic creation) */
  isCreating?: boolean;
};

// Inner component that has access to DatasetColumnContext
const DatasetByIdInner: FC<DatasetByIdProps> = ({
  id,
  drilldownFilters,
  pageSize,
  isReadOnly = false,
  isCreating = false,
  containerStyle,
  gridStyle,
  updateDatasetTitleInParent,
  updateFiltersInParent,
  updateFilterConfigInParent,
  parentSelectedFilters,
}) => {
  const {
    initializeColumns,
    getColumnNamesMap,
    columnOrder: contextColumnOrder,
    columns: contextColumns, // Get columns from context
    columnVisibility: contextColumnVisibility, // Get visibility map for sync
    updateColumnIdsFromBE, // Update column IDs after SSE event
  } = useDatasetColumnContext(); // Access the unified column context
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const firstLoadDone = useRef(false);
  const tableRef = useRef<AgGridReact>(null);
  const datasetTableRef = useRef<HTMLDivElement>(null);
  const {
    dispatch,
    state: { selectedFilters, filtersConfig },
  } = useFiltersContextStore();
  const currency = searchParams?.get('currency') ?? LOCAL_CURRENCY;
  const [columns, setColumns] = useState<ColDef[]>([]);
  const [totalRows, setTotalRows] = useState<number>(0);
  const [deleteRuleId, setDeleteRuleId] = useState<string>();
  const [gridReady, setGridReady] = useState<boolean>(false);
  const [datasetTitle, setDatasetTitle] = useState<string>('');
  const isDatasetCreationEnabled = useIsDatasetCreationEnabled();
  const { pendingTitle, setPendingTitle } = usePendingDatasetContext() || {};
  const [fxCurrency, setFxCurrency] = useState<string[]>([currency]);
  const [rowPropertiesData, setRowPropertiesData] = useState<MapAny>();
  const [exportsDatasetQuery, setExportsDatasetQuery] = useState<string>('');
  const [isNoRowsOverlayVisible, setIsNoRowsOverlayVisible] = useState<boolean>(false);
  const [isRulesListingSideDrawerOpen, setIsRulesListingSideDrawerOpen] = useState(false);
  const [cachedDatasetData, setCachedDatasetData] = useState<DatasetDataResponseType>();
  const [hiddenColumnFilters, setHiddenColumnFilters] = useState<MapAny>();
  const [ruleColumnDetails, setRuleColumnDetails] = useState<RuleColumnDetailsType>({
    colId: '',
    columnLabel: '',
    tagColorMap: {},
  });
  const [showAiTransformationStatus, setShowAiTransformationStatus] = useState<{
    open: boolean;
    status: string;
    title: string;
    description: string;
  }>({
    open: false,
    status: LOADER_STATUS.LOADING,
    title: '',
    description: '',
  });
  const { handleColumnMoved: syncColumnMoved, handleVisibilityChange: syncVisibilityChange } = useDatasetGridSync(); // Use the grid sync hook for AG Grid events
  const { checkUserPrivilege } = useResourceAccess({
    resourceType: ResourceType.DATASET,
    resourceId: id,
    skipAudienceData: false,
    skipTeamsData: false,
  });

  // Get full dataset metadata from Battalion for localStorage sync
  const { data: datasets } = useResource<Dataset>('Dataset');
  const currentDataset = datasets?.find((d) => d.id === id);

  const {
    data: filterConfigData,
    refetch: refetchFilterConfig,
    isFetching,
    isLoading: isFilterConfigLoading,
    isError,
    isUninitialized,
  } = useGetDatasetFilterConfigQuery(
    {
      datasetId: id as string,
    },
    {
      skip: !id || isCreating, // Skip when creating new dataset optimistically
      refetchOnMountOrArgChange: true, // Refetch on mount to get fresh column aliases after transactions
    },
  );

  const [getDatasetData, { data: datasetData, isError: lazyloadDataSetError }] = useLazyGetDatasetDataQuery();
  const [updateDatasetData] = useUpdateDatasetDataMutation();
  const filters = decodeURIComponent(searchParams?.get('filters') ?? '');
  const processId = params?.processId as string;
  const activityId = params?.activityId;
  const tabFromUrl = searchParams?.get('tab');
  const isDatasetCreationModeEnabled = useCheckDatasetCreationEnabled();
  const isValidTab = tabFromUrl === DatasetTabsTypes.BLUEPRINT || tabFromUrl === DatasetTabsTypes.PREVIEW;
  const initialTab = isValidTab ? tabFromUrl : DatasetTabsTypes.PREVIEW;
  const [selectedTab, setSelectedTab] = useState<DatasetTabsTypes>(initialTab);

  const serverSideDatasource: IServerSideDatasource = useMemo(() => {
    return {
      getRows: (parameters: IServerSideGetRowsParams): void => {
        // For creation mode, return empty rows immediately (no server data yet)
        if (isCreating) {
          setIsNoRowsOverlayVisible(true);
          parameters.success({
            rowData: [],
            rowCount: 0,
          });

          return;
        }

        const queryConfig = getEncodedRequest(
          parameters.request,
          fxCurrency?.[0],
          false,
          false,
          false,
          hiddenColumnFilters,
          undefined,
          pageSize,
        );

        const filterModel = parameters?.request?.filterModel;
        const isDefaultFilters = checkIsObjectEmpty(filterModel ?? {})
          ? false
          : Object.values(filterModel ?? {}).every((filter) => filter?.isDefault);

        removeCellFocus(tableRef);
        setExportsDatasetQuery(queryConfig);
        if (!firstLoadDone.current || isDefaultFilters) {
          // Use Cached Data for First Load
          firstLoadDone.current = true; // Mark first load as done
          if (drilldownFilters?.conditions === null) {
            setIsNoRowsOverlayVisible(true);
            parameters.success({
              rowData: [],
              rowCount: 0,
            });
          } else if (!checkIsObjectEmpty(cachedDatasetData)) {
            const totalCount = cachedDatasetData?.data?.total_count ?? 0;

            setIsNoRowsOverlayVisible(totalCount === 0);
            parameters.success({
              rowData: cachedDatasetData?.data?.rows ?? [],
              ...(parameters.request.startRow === 0 ? { rowCount: totalCount } : {}),
            });
          }
        } else {
          getDatasetData({
            datasetId: id as string,
            query_config: queryConfig,
          })
            .unwrap()
            .then((response) => {
              const totalCount = response?.data?.total_count;

              if (parameters.request.startRow === 0) {
                setDatasetTitle(response?.title);
                setTotalRows(totalCount);
                setIsNoRowsOverlayVisible(totalCount === 0);
                dispatch({
                  type: filtersContextActions.SET_TOTAL_ROWS,
                  payload: { totalRows: totalCount },
                });
              }
              parameters.success({
                rowData: response?.data?.rows,
                ...(parameters.request.startRow === 0
                  ? { rowCount: pageSize ? (totalCount < pageSize ? totalCount : pageSize) : totalCount }
                  : {}),
              });
            })
            .catch(() => {
              parameters.fail();
            });
        }
      },
    };
  }, [getDatasetData, id, fxCurrency, cachedDatasetData, drilldownFilters, processId, activityId, isCreating]);

  const handleSuccessfulUpdate = (actionType = DATASET_ACTION_TYPE.UPDATE_MISSING_FIELD) => {
    tableRef.current?.api?.refreshServerSide();
    toast.success(DatasetActionMessages[actionType].SUCCESS);
  };

  const currentUserHasEditAccess = useMemo(() => {
    return (
      checkUserPrivilege(DATASET_ACCESS_PRIVILEGES.ADMIN) || checkUserPrivilege(DATASET_ACCESS_PRIVILEGES.DATA_EDITOR)
    );
  }, [checkUserPrivilege]);

  const updateApi = ({
    rowId,
    field,
    newValue,
    operator = CONDITION_OPERATOR_TYPE.EQUAL,
    idColumn = ColumnType.ID,
  }: {
    rowId: string | string[];
    field: string;
    newValue: string;
    operator?: CONDITION_OPERATOR_TYPE;
    idColumn?: string;
  }) => {
    updateDatasetData({
      datasetId: id as string,
      data: {
        filters: {
          logical_operator: LogicalOperatorType.OperatorLogicalAnd,
          conditions: [
            {
              column: idColumn,
              value: rowId,
              operator: operator,
            },
          ],
        },
        update: {
          column: field as string,
          value: newValue,
        },
      },
    })
      .unwrap()
      .then(() => handleSuccessfulUpdate())
      .catch(() => toast.error(DatasetActionMessages[DATASET_ACTION_TYPE.UPDATE_MISSING_FIELD].ERROR));
  };

  const onCellEditRequest = (event: CellEditRequestEvent) => {
    const { colDef, newValue, data, source, node } = event;
    const { field } = colDef;
    const updatedRow = { ...event.data, [field as string]: newValue };

    // Optimistic update
    node.setData(updatedRow);

    if (source === SourceType.EDIT || source === SourceType.API) {
      const rowId = data?._zamp_id || data?.id;
      const idColumn = data?._zamp_id ? ColumnType._ZAMP_ID : ColumnType.ID;

      updateApi({
        rowId: rowId as string,
        field: field as string,
        newValue,
        idColumn,
      });
    }
  };

  const onFillEnd = (event: FillEndEvent) => {
    const { finalRange } = event;
    const { startRow, endRow, startColumn } = finalRange;

    const startIndex = startRow?.rowIndex as number;
    const endIndex = endRow?.rowIndex as number;
    const field = startColumn?.getColId();
    const rowIds: string[] = [];
    let newValue = '';
    let loopStartIndex = startIndex;
    let loopEndIndex = endIndex;
    let idColumn = ColumnType.ID;

    if (startIndex > endIndex) {
      loopStartIndex = endIndex;
      loopEndIndex = startIndex;
    }
    for (let i = loopStartIndex; i <= loopEndIndex; i++) {
      const row = tableRef.current?.api?.getDisplayedRowAtIndex(i);

      const rowId = row?.data?._zamp_id || row?.data?.id;

      rowIds.push(rowId as string);

      // Set idColumn based on first row
      if (i === loopStartIndex) {
        idColumn = row?.data?._zamp_id ? ColumnType._ZAMP_ID : ColumnType.ID;
      }

      if (i === startIndex) {
        newValue = row?.data?.[field as string] as string;
      }
    }

    updateApi({
      rowId: rowIds,
      field,
      newValue,
      operator: CONDITION_OPERATOR_TYPE.IN,
      idColumn,
    });
  };

  const handleRulesListingSideDrawerOpen = (ruleColumnDetailsValue: RuleColumnDetailsType) => {
    setIsRulesListingSideDrawerOpen(true);
    setRuleColumnDetails(ruleColumnDetailsValue);
  };

  const handleFilterChange = (value: string[]) => {
    setFxCurrency(value);
  };

  const handleRefetchDataset = () => {
    getDatasetData({
      datasetId: id as string,
      query_config: exportsDatasetQuery,
    });
  };

  const handleDeleteRuleSuccess = () => {
    setIsRulesListingSideDrawerOpen(false);
    handleSuccessfulUpdate(DATASET_ACTION_TYPE.RULE_DELETION);
  };

  const initializeFilterConfig = () => {
    // For new datasets, we need to load columns from localStorage even if there's no backend data
    if (isCreating) {
      // Load columns directly from localStorage for new datasets
      let storedConfig = getColumnOrderingVisibilityForCurrentDataset(id as string);

      if (!storedConfig || storedConfig.length === 0) {
        // Try PREVIEW_DATASET_ID if id is empty
        const PREVIEW_DATASET_ID = 'preview-dataset';

        storedConfig = getColumnOrderingVisibilityForCurrentDataset(PREVIEW_DATASET_ID);
      }

      if (storedConfig && storedConfig.length > 0) {
        const tempColumns = storedConfig.map((stored, index) => ({
          id: stored.colId,
          column_name: stored.columnName?.trim() ? stored.columnName : `Column ${index + 1}`,
          column_type: (stored.columnType?.toLowerCase() as any) || DatasetColumnTypes.TEXT.toLowerCase(),
          required: stored.isRequired ?? false,
          default: stored.defaultValue ?? null,
        }));

        if (tempColumns.length > 0) {
          // Use the dataset ID if available, otherwise use PREVIEW_DATASET_ID
          const datasetIdForInit = id && id.trim() !== '' ? id : 'preview-dataset';

          initializeColumns(tempColumns, datasetIdForInit);
        }
      } else {
        // No stored config for new dataset - initialize with empty array to trigger default "Column 1" creation
        const datasetIdForInit = id && id.trim() !== '' ? id : 'preview-dataset';

        initializeColumns([], datasetIdForInit);
      }

      return;
    }

    // For existing datasets, require backend filter config data
    if (!filterConfigData?.data?.length || isFetching || isUninitialized) return;

    // Format backend columns for AG Grid
    const backendAgGridColumns = formatColumns({
      filterConfig: filterConfigData?.data,
      currentUserHasEditAccess,
      datasetId: id,
      handleSuccessfulUpdate,
      tableRef,
      handleRulesListingSideDrawerOpen,
      isSelfServe: true,
    });

    // Merge backend columns with frontend-only columns from localStorage
    const storedConfigForAgGrid = getColumnOrderingVisibilityForCurrentDataset(id as string);
    const finalColumns = mergeBackendAndFrontendColumns(backendAgGridColumns, storedConfigForAgGrid, {
      datasetId: id as string,
      handleSuccessfulUpdate,
      tableRef,
    });

    if (finalColumns.length === 0) return;

    setColumns(finalColumns);

    const filtersConfig = filterConfigData?.data
      ?.filter((item) => !item?.metadata?.is_hidden)
      ?.map((column) => ({
        key: column.column,
        label: column.alias ?? snakeCaseToSentenceCase(column?.column),
        values: column.options,
        type: getColumnType(column),
      }));

    dispatch({
      type: filtersContextActions.SET_FILTERS_CONFIG,
      payload: { filtersConfig },
    });
    updateFilterConfigInParent?.(filtersConfig);

    if (filters) {
      firstLoadDone.current = false;
      dispatch({
        type: filtersContextActions.INITIALIZE_DEFAULT_FILTERS,
        payload: { selectedFilters: getFilters(filters, filterConfigData.data) ?? {} },
      });
    }

    if (parentSelectedFilters) {
      dispatch({
        type: filtersContextActions.INITIALIZE_DEFAULT_FILTERS,
        payload: { selectedFilters: parentSelectedFilters },
      });
    }

    // Initialize Blueprint columns from filterConfig
    // HYBRID APPROACH: Merge backend columns + localStorage-only columns
    const backendColumns = convertFilterConfigToColumns(filterConfigData.data);

    // Check localStorage for additional columns (FE-only columns from Blueprint)
    // For new datasets, if id is empty, also check PREVIEW_DATASET_ID
    let storedConfig = getColumnOrderingVisibilityForCurrentDataset(id as string);

    if ((!storedConfig || storedConfig.length === 0) && (!id || id.trim() === '') && isCreating) {
      const PREVIEW_DATASET_ID = 'preview-dataset';

      storedConfig = getColumnOrderingVisibilityForCurrentDataset(PREVIEW_DATASET_ID);
    }
    const storedColIds = storedConfig?.map((c) => c.colId) || [];

    // Find new columns in localStorage that aren't in backend
    // For new datasets (isCreating), include FE temp columns; for existing datasets, filter them out
    const newColumnsInStorage = storedColIds.filter((colId) => {
      // Skip if column exists in backend
      if (backendColumns.some((bc) => bc.id === colId)) return false;

      // For existing datasets, skip FE-generated temporary column IDs (col_<timestamp>_<random>)
      // These are temporary IDs used during creation flow and should be replaced by BE IDs after save
      // For new datasets, we need to include them so they can be loaded on reload
      if (!isCreating && /^col_\d+_/.test(colId)) return false;

      return true;
    });

    // Create placeholder columns for FE-only columns
    const newColumnDefs = newColumnsInStorage.map((colId) => {
      const stored = storedConfig.find((c) => c.colId === colId);

      // If stored columnName matches colId (auto-generated), convert it to display format
      // Otherwise, preserve the user-set custom name
      const isAutoGeneratedName = !stored?.columnName || stored.columnName === colId;
      const columnName = isAutoGeneratedName ? snakeCaseToDisplayName(colId) : (stored?.columnName ?? colId);

      // Convert stored columnType from uppercase to lowercase if needed
      let storedColumnType = stored?.columnType;

      if (storedColumnType && storedColumnType === storedColumnType.toUpperCase()) {
        storedColumnType = storedColumnType.toLowerCase();
      }

      return {
        id: colId,
        column_name: columnName,
        column_type:
          (storedColumnType as DatasetColumnTypes) || (DATASET_COLUMN_TYPES_LIST[0].value as DatasetColumnTypes),
        required: stored?.isRequired ?? false,
        default: stored?.defaultValue ?? null,
      };
    });

    // Merge backend + FE-only columns in localStorage order
    const allColumns = mergeAndOrderItems(backendColumns, newColumnDefs, storedColIds);

    // For new datasets, use PREVIEW_DATASET_ID if id is empty
    const datasetIdForInit = id && id.trim() !== '' ? id : isCreating ? 'preview-dataset' : id;

    if (allColumns.length > 0) {
      initializeColumns(allColumns, datasetIdForInit as string);
    } else if (isCreating && storedConfig && storedConfig.length > 0) {
      // For new datasets, even if allColumns is empty (e.g., only FE temp columns),
      // we should still initialize with columns from localStorage
      const tempColumns = storedConfig.map((stored, index) => {
        // Convert stored columnType from uppercase to lowercase if needed
        let storedColumnType = stored.columnType;

        if (storedColumnType && storedColumnType === storedColumnType.toUpperCase()) {
          storedColumnType = storedColumnType.toLowerCase();
        }

        return {
          id: stored.colId,
          column_name: stored.columnName?.trim() ? stored.columnName : `Column ${index + 1}`,
          column_type:
            (storedColumnType as DatasetColumnTypes) || (DATASET_COLUMN_TYPES_LIST[0].value as DatasetColumnTypes),
          required: stored.isRequired ?? false,
          default: stored.defaultValue ?? null,
        };
      });

      if (tempColumns.length > 0) {
        initializeColumns(tempColumns, datasetIdForInit as string);
      }
    } else if (isCreating && (!storedConfig || storedConfig.length === 0)) {
      // For new datasets with no columns and no stored config, initialize with empty array
      // This will trigger the default "Column 1" creation in initializeColumns
      initializeColumns([], datasetIdForInit as string);
    }

    if (drilldownFilters) {
      firstLoadDone.current = false;
      const { selectedDrilldownFilters, hiddenDrilldownFilters } = formatDrilldownFilters(
        drilldownFilters,
        filterConfigData?.data,
      );

      if (!checkIsObjectEmpty(hiddenDrilldownFilters)) setHiddenColumnFilters(hiddenDrilldownFilters);
      if (!checkIsObjectEmpty(selectedDrilldownFilters)) {
        dispatch({
          type: filtersContextActions.INITIALIZE_DEFAULT_FILTERS,
          payload: { selectedFilters: selectedDrilldownFilters },
        });
      }
    }
  };

  const fetchInitialDatasetData = () => {
    // Skip fetching when creating new dataset optimistically
    if (isCreating) return;

    firstLoadDone.current = false;

    if (drilldownFilters?.conditions === null) return;

    const urlFilters = formatUrlFilters(filters ?? '');
    const queryConfig = getEncodedRequest(
      {} as IServerSideGetRowsRequest,
      fxCurrency?.[0],
      false,
      false,
      false,
      hiddenColumnFilters,
      urlFilters ?? drilldownFilters,
      pageSize,
    );

    getDatasetData({
      datasetId: id as string,
      query_config: queryConfig,
    })
      .unwrap()
      .then((response) => {
        setDatasetTitle(response?.title);
        setTotalRows(response?.data?.total_count);
        setCachedDatasetData(response);
        dispatch({
          type: filtersContextActions.SET_TOTAL_ROWS,
          payload: { totalRows: response?.data?.total_count },
        });
      })
      .catch((err) => {
        captureException(err);
      });
  };

  const handleTabSelect = (value: DatasetTabsTypes) => {
    setSelectedTab(value);
    // Update URL query param without losing other query params
    const newSearchParams = new URLSearchParams(searchParams?.toString() || '');

    newSearchParams.set('tab', value);
    router.push(`${pathname}?${newSearchParams.toString()}`, { scroll: false });
  };

  const getTabVisibilityClass = (tabType: string) => {
    return cn('h-full', selectedTab === tabType ? 'block' : 'hidden');
  };

  useEffect(() => {
    initializeFilterConfig();
  }, [
    filterConfigData?.data,
    filters,
    id,
    drilldownFilters,
    isFetching,
    isUninitialized,
    currentUserHasEditAccess,
    isCreating,
  ]);

  useEffect(() => {
    if (gridReady && selectedFilters) {
      tableRef.current?.api?.setFilterModel(selectedFilters);
      updateFiltersInParent?.(selectedFilters);
    }
  }, [selectedFilters, fxCurrency, gridReady]);

  // Sync AG Grid with context state (order, names, visibility, add/remove columns)
  useAgGridContextSync({
    gridReady,
    contextColumnOrder,
    contextColumns,
    contextColumnVisibility,
    getColumnNamesMap,
    tableRef,
    columns,
    setColumns,
    id: id as string,
    handleSuccessfulUpdate,
    selectedTab,
  });

  // Listen for dataset SSE events to update localStorage and context with correct column IDs after transaction
  useDatasetSSE({
    datasetId: id as string,
    updateColumnIdsFromBE,
  });

  useEffect(() => {
    if (isNoRowsOverlayVisible) {
      tableRef.current?.api?.showNoRowsOverlay();
    } else {
      tableRef.current?.api?.hideOverlay();
    }
  }, [isNoRowsOverlayVisible]);

  // Initialize pendingTitle from localStorage on load (for breadcrumb)
  useEffect(() => {
    if (id && !isCreating) {
      try {
        const datasetData = getColumnConfigForDataset(id);

        if (datasetData && typeof datasetData === 'object' && 'dataset_name' in datasetData) {
          const storedName = (datasetData as { dataset_name?: string }).dataset_name;

          if (storedName && storedName.trim() !== '') {
            setPendingTitle?.(storedName);
          }
        }
      } catch (error) {
        console.error('[Dataset] Error reading from localStorage:', error);
      }
    }
  }, [id, isCreating, setPendingTitle]);

  // Sync localStorage from backend dataset metadata ONLY when localStorage is completely empty
  // Never overwrite existing localStorage data - preserve user changes
  useEffect(() => {
    if (currentDataset && !isCreating && id) {
      // Check if localStorage already has data for this dataset
      try {
        const datasetData = getColumnConfigForDataset(id);

        // Only sync if localStorage is completely empty (no data at all for this dataset)
        const hasColumnData =
          datasetData &&
          ((Array.isArray(datasetData) && (datasetData as unknown[]).length > 0) ||
            (typeof datasetData === 'object' &&
              'columns' in datasetData &&
              Array.isArray((datasetData as { columns?: unknown[] }).columns) &&
              (datasetData as { columns: unknown[] }).columns.length > 0));

        // Only sync if localStorage is empty - never overwrite existing data
        if (!hasColumnData) {
          syncSingleDatasetToLocalStorage(currentDataset as any);
        }
        // If localStorage has data, do nothing - preserve user changes
      } catch {
        // If error, sync from backend
        syncSingleDatasetToLocalStorage(currentDataset as any);
      }
    }
  }, [currentDataset, id, isCreating]);

  useEffect(() => {
    fetchInitialDatasetData();
  }, [filters, drilldownFilters, id, processId, activityId, isCreating]);

  useEffect(() => {
    updateDatasetTitleInParent?.(datasetTitle);
  }, [datasetTitle, updateDatasetTitleInParent]);

  useOnClickOutside(datasetTableRef, () => removeCellFocus(tableRef));

  return (
    <CommonWrapper
      className={cn('h-full', {
        'flex flex-col items-center justify-center': isFilterConfigLoading,
      })}
      isLoading={isFilterConfigLoading}
      isError={isError}
      skeletonType={SkeletonTypes.CUSTOM}
      refetchFunction={refetchFilterConfig}
      loader={
        <ImageLoader imageSrc={ZAMP_LOGO_LOADER_SVG} width={140} height={140} className='z-50 h-[calc(100vh-200px)]' />
      }
    >
      <div className='flex h-full flex-col'>
        <div className={cn('flex shrink-0 items-center justify-between gap-y-3 pr-8')}>
          <div className='flex items-center py-3'>
            <FiltersWrapper label='Filter' filterConfig={filtersConfig ?? []} disable={isDatasetCreationModeEnabled} />
          </div>

          <div className='relative flex items-center gap-2.5 py-3'>
            {isDatasetCreationEnabled && (
              <DatasetEditPreviewTab selectedTab={selectedTab} handleTabSelect={handleTabSelect} />
            )}
            {!isReadOnly && !isDatasetCreationModeEnabled && (
              <TableSchemaAlignmentStatus
                showAiTransformationStatus={showAiTransformationStatus}
                setShowAiTransformationStatus={setShowAiTransformationStatus}
              />
            )}
            {!isReadOnly && (
              <ExportDataset
                query={exportsDatasetQuery}
                datasetId={id as string}
                hasFilters={!!Object.keys(selectedFilters)?.length}
                tableRef={tableRef}
                disable={isDatasetCreationModeEnabled}
              />
            )}
            {!isReadOnly && (
              <ImportDataset
                onRefetch={handleRefetchDataset}
                setShowAiTransformationStatus={setShowAiTransformationStatus}
                disable={isDatasetCreationModeEnabled}
              />
            )}
            {!isReadOnly && <DatasetHistory disable={isDatasetCreationModeEnabled} />}
            {!isReadOnly && (
              <>
                <DisplayOptions tableRef={tableRef} datasetId={id as string} isSelfServe />
                {filterConfigData?.config?.is_fx_enabled && (
                  <div className='flex items-center gap-2'>
                    <div className='border-GRAY_400 h-7 border-r'></div>
                    <SingleSelectFilter
                      onFilterChange={handleFilterChange}
                      value={fxCurrency}
                      filterKey='fx_currency'
                      label='Currency'
                      showColumnLabel={false}
                      options={PAGE_CURRENCY_OPTIONS}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {isDatasetCreationEnabled && (
          <div className={cn('min-h-0 flex-1', getTabVisibilityClass(DatasetTabsTypes.BLUEPRINT))}>
            <BluePrintDataset
              datasetId={id as string}
              isCreating={isCreating}
              title={datasetTitle || pendingTitle}
              onTransactionSuccess={() => {
                handleTabSelect(DatasetTabsTypes.PREVIEW);
                refetchFilterConfig();
              }}
            />
          </div>
        )}

        <div className={cn('min-h-0 flex-1', getTabVisibilityClass(DatasetTabsTypes.PREVIEW))}>
          <CommonWrapper
            isError={lazyloadDataSetError}
            errorCardTitle='Failed to load dataset'
            errorCardSubTitle='Please try again later'
            refetchFunction={handleRefetchDataset}
          >
            <div className='sensitive z-10 h-full w-full' ref={datasetTableRef}>
              <DatasetTable
                tableRef={tableRef}
                columns={columns}
                serverSideDatasource={serverSideDatasource}
                columnConfig={{
                  enableRowGroup: true,
                  enableValue: true,
                  headerComponent: CustomHeader,
                  // Use fixed widths for all dataset columns (no flex stretching)
                  // BE columns will use their stored width from localStorage
                  // FE-generated columns default to 150px
                  flex: 0,
                  width: 150,
                  minWidth: 100,
                  maxWidth: 400,
                }}
                totalRows={totalRows}
                onCellEditRequest={onCellEditRequest}
                onFillEnd={onFillEnd}
                onRowPropertiesClick={(data) => setRowPropertiesData(data)}
                onColumnMoved={(event) => syncColumnMoved(event)}
                onColumnVisible={(event: ColumnVisibleEvent) => {
                  const column = event.column;

                  if (column) {
                    const colId = column.getColId();
                    const isVisible = column.isVisible();

                    syncVisibilityChange(colId, isVisible);
                  }
                }}
                onGridReady={() => setGridReady(true)}
                containerStyle={containerStyle}
                gridStyle={gridStyle}
                {...(datasetData?.data?.config?.is_drilldown_enabled
                  ? {
                      onDrilldownClick: (data) =>
                        handleDrilldownClick(data, id as string, params?.pageId as string, router),
                    }
                  : {})}
              />
            </div>
          </CommonWrapper>
        </div>
      </div>
      {isRulesListingSideDrawerOpen && (
        <RulesListingSideDrawer
          column={ruleColumnDetails?.colId}
          columnLabel={ruleColumnDetails?.columnLabel}
          tagColorMap={ruleColumnDetails?.tagColorMap}
          onClose={() => setIsRulesListingSideDrawerOpen(false)}
          datasetId={id as string}
          handleSuccessfulUpdate={handleSuccessfulUpdate}
          onDeleteRuleId={setDeleteRuleId}
        />
      )}
      {rowPropertiesData && (
        <RowPropertiesSideDrawer
          data={rowPropertiesData}
          onClose={() => setRowPropertiesData(undefined)}
          datasetId={id as string}
          isDrillDownEnabled={datasetData?.data?.config?.is_drilldown_enabled}
          columns={columns}
        />
      )}
      {deleteRuleId && (
        <RuleDelete
          isOpen={!!deleteRuleId}
          onClose={() => setDeleteRuleId('')}
          ruleId={deleteRuleId ?? ''}
          onSuccess={handleDeleteRuleSuccess}
        />
      )}
    </CommonWrapper>
  );
};

// Dependencies for the DatasetColumnProvider
const datasetColumnDependencies: DatasetColumnDependencies = {
  getFromLocalStorage: getFromLocalStorage as (key: string) => string | null,
  setToLocalStorage: setToLocalStorage as (key: string, value: string) => void,
  LOCAL_STORAGE_KEYS: { COLUMN_ORDERING_VISIBILITY: LOCAL_STORAGE_KEYS.COLUMN_ORDERING_VISIBILITY },
  getColumnConfigForDataset,
  setColumnConfigForDataset,
  deleteColumnConfigForDataset,
  NEW_COLUMN_PREFIX: { COL_: NEW_COLUMN_PREFIX.COL_ },
  useGetDatasetDisplayConfigQuery:
    useGetDatasetDisplayConfigQuery as unknown as DatasetColumnDependencies['useGetDatasetDisplayConfigQuery'],
  useUpdateDatasetMutation:
    useUpdateDatasetMutation as unknown as DatasetColumnDependencies['useUpdateDatasetMutation'],
  captureException,
};

// Outer component that provides the DatasetColumnContext
const DatasetById: FC<DatasetByIdProps> = (props) => {
  // When creating, don't pass API hooks to prevent unnecessary API calls
  const dependencies = props.isCreating
    ? {
        ...datasetColumnDependencies,
        useGetDatasetDisplayConfigQuery: undefined,
        useUpdateDatasetMutation: undefined,
      }
    : datasetColumnDependencies;

  return (
    <DatasetColumnProvider datasetId={props.id as string} dependencies={dependencies}>
      <DatasetByIdInner {...props} />
    </DatasetColumnProvider>
  );
};

export default withFiltersContext(DatasetById);
