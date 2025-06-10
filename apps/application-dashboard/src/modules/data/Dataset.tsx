'use client';

import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { captureException } from '@sentry/browser';
import {
  CellEditRequestEvent,
  ColDef,
  ColumnMovedEvent,
  FillEndEvent,
  IServerSideDatasource,
  IServerSideGetRowsParams,
  IServerSideGetRowsRequest,
} from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import {
  useGetDatasetFilterConfigQuery,
  useLazyGetActionStatusQuery,
  useLazyGetDatasetDataQuery,
  useUpdateDatasetDataMutation,
} from 'apis/dataset';
import { ZAMP_LOGO_LOADER } from 'constants/lottie/zamp-logo-loader';
import { getDatasetDrilldownRoute, getPageDatasetDrilldownRoute } from 'constants/routeConfig';
import { useOnClickOutside } from 'hooks';
import usePolling from 'hooks/usePolling';
import DatasetHistory from 'modules/data/components/datasetHistory/index';
import ExportDataset from 'modules/data/components/exportDataset';
import ImportDataset from 'modules/data/components/importDataset/index';
import TableSchemaAlignmentStatus from 'modules/data/components/importDataset/TableSchemaAlignmentStatus';
import { DatasetActionMessages } from 'modules/data/data.constants';
import {
  DATASET_ACTION_STATUS,
  DATASET_ACTION_TYPE,
  LOADER_STATUS,
  RuleColumnDetailsType,
} from 'modules/data/data.types';
import {
  formatColumns,
  formatDrilldownFilters,
  formatUrlFilters,
  getColumnOrderingVisibilityForCurrentDataset,
  getFilters,
  syncFilterConfigHiddenColumnsInLocalStorage,
} from 'modules/data/data.utils';
import Notification from 'modules/data/Notification';
import RowPropertiesSideDrawer from 'modules/data/RowProperties';
import RulesListingSideDrawer from 'modules/data/RulesListing';
import RuleDelete from 'modules/data/RulesListing/RuleDelete';
import { LOCAL_CURRENCY, PAGE_CURRENCY_OPTIONS } from 'modules/page/pages.constants';
import { useResourceAccess } from 'modules/shareResource/hooks/useResourceAccess';
import { DATASET_ACCESS_PRIVILEGES, ResourceType } from 'modules/shareResource/shareResource.types';
import SingleSelectFilter from 'modules/widgets/components/SingleSelectFilter';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  DatasetActionStatusResponseType,
  DatasetDataResponseType,
  DatasetUpdateResponseType,
} from 'types/api/dataset.types';
import { MapAny } from 'types/commonTypes';
import { FilterModelType, LogicalOperatorType } from 'types/components/table.type';
import { checkIsObjectEmpty, cn, snakeCaseToSentenceCase } from 'utils/common';
import { getFromLocalStorage, LOCAL_STORAGE_KEYS, setToLocalStorage } from 'utils/localstorage';
import { useLazyGetDatasetArtifactsQuery } from '@/apis/processes';
import { CUSTOM_COLUMNS_TYPE } from '@/components/common/table/table.types';
import { TOAST_MESSAGES } from '@/components/common/toast/toast.constants';
import { FILTER_TYPES } from '@/components/filter/filter.types';
import CustomHeader from 'components/common/table/CustomHeader';
import DatasetTable from 'components/common/table/DatasetTable';
import DisplayOptions from 'components/common/table/DisplayOptions';
import { getEncodedRequest } from 'components/common/table/table.utils';
import { toast } from 'components/common/toast/Toast';
import CommonWrapper from 'components/commonWrapper';
import { SkeletonTypes } from 'components/commonWrapper/commonWrapper.types';
import DynamicLottiePlayer from 'components/DynamicLottiePlayer';
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
  headerClassName?: string;
  updateDatasetTitleInParent?: (title: string) => void;
  updateFiltersInParent?: (filters: MapAny) => void;
  updateFilterConfigInParent?: (filterConfig: MapAny[]) => void;
  parentSelectedFilters?: MapAny;
  updateBreadcrumb?: boolean;
  filterWrapperClassName?: string;
  showCurrencyFilter?: boolean;
  showDatasetHistory?: boolean;
  isDatasetArtifact?: boolean;
};

const DatasetById: FC<DatasetByIdProps> = ({
  id,
  drilldownFilters,
  pageSize,
  isReadOnly = false,
  containerStyle,
  gridStyle,
  headerClassName,
  updateDatasetTitleInParent,
  updateFiltersInParent,
  updateFilterConfigInParent,
  parentSelectedFilters,
  filterWrapperClassName,
  showDatasetHistory = true,
  isDatasetArtifact = false,
}) => {
  const searchParams = useSearchParams();
  const params = useParams();
  const filters = decodeURIComponent(searchParams?.get('filters') ?? '');
  const processId = searchParams?.get('processId') as string;
  const activityId = params?.activityId;

  const currency = searchParams?.get('currency') ?? LOCAL_CURRENCY;

  const { checkUserPrivilege } = useResourceAccess(ResourceType.DATASET, id);

  const currentUserHasEditAccess = useMemo(() => {
    return (
      checkUserPrivilege(DATASET_ACCESS_PRIVILEGES.ADMIN) || checkUserPrivilege(DATASET_ACCESS_PRIVILEGES.DATA_EDITOR)
    );
  }, [checkUserPrivilege]);

  const {
    data: filterConfigData,
    refetch: refetchFilterConfig,
    isFetching,
    isError,
    isUninitialized,
  } = useGetDatasetFilterConfigQuery(
    {
      datasetId: id as string,
    },
    {
      skip: !id,
      refetchOnMountOrArgChange: true,
    },
  );
  const showFileImports = filterConfigData?.config?.is_file_import_enabled;
  const [updateDatasetData] = useUpdateDatasetDataMutation();
  const [getActionStatus] = useLazyGetActionStatusQuery();
  const [columns, setColumns] = useState<ColDef[]>([]);
  const [isPolling, setIsPolling] = useState<boolean>(false);
  const [totalRows, setTotalRows] = useState<number>(0);
  const [ruleColumnDetails, setRuleColumnDetails] = useState<RuleColumnDetailsType>({
    colId: '',
    columnLabel: '',
    tagColorMap: {},
  });
  const [isRulesListingSideDrawerOpen, setIsRulesListingSideDrawerOpen] = useState(false);
  const [rowPropertiesData, setRowPropertiesData] = useState<MapAny>();
  const [exportsDatasetQuery, setExportsDatasetQuery] = useState<string>('');
  const [datasetTitle, setDatasetTitle] = useState<string>('');
  const [fxCurrency, setFxCurrency] = useState<string[]>([currency]);
  const [initiatedActionIds, setInitiatedActionIds] = useState<string[]>([]);
  const [isNoRowsOverlayVisible, setIsNoRowsOverlayVisible] = useState<boolean>(false);
  const [cachedDatasetData, setCachedDatasetData] = useState<DatasetDataResponseType>();
  // Removed because it is causing load on star tree
  // const [columnLevelStats, setColumnLevelStats] = useState<MapAny>();
  const [hiddenColumnFilters, setHiddenColumnFilters] = useState<MapAny>();
  const [deleteRuleId, setDeleteRuleId] = useState<string>();
  const [pollingMessage, setPollingMessage] = useState<string>('');

  const firstLoadDone = useRef(false); // Track if first load is done

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
  const { startPolling } = usePolling();
  const [getDatasetData, { data: datasetData, isError: lazyloadDataSetError }] = useLazyGetDatasetDataQuery();
  const [getDatasetArtifacts, { data: datasetArtifacts, isError: lazyloadDatasetArtifactsError }] =
    useLazyGetDatasetArtifactsQuery();

  const {
    dispatch,
    state: { selectedFilters, filtersConfig },
  } = useFiltersContextStore();

  const serverSideDatasource: IServerSideDatasource = useMemo(() => {
    return {
      getRows: (parameters: IServerSideGetRowsParams): void => {
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

        removeCellFocus();
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
          if (isDatasetArtifact) {
            getDatasetArtifacts({
              processId: processId as string,
              activityRunId: activityId as string,
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
        }
      },
    };
  }, [
    getDatasetData,
    id,
    fxCurrency,
    cachedDatasetData,
    drilldownFilters,
    isDatasetArtifact,
    getDatasetArtifacts,
    processId,
    activityId,
  ]);

  const router = useRouter();
  const tableRef = useRef<AgGridReact>(null);
  const datasetTableRef = useRef<HTMLDivElement>(null);

  const removeCellFocus = () => {
    tableRef.current?.api?.clearCellSelection();
    tableRef.current?.api?.clearFocusedCell();
  };

  const handleSuccessfulUpdate = (
    data: DatasetUpdateResponseType,
    showPolling = true,
    actionType = DATASET_ACTION_TYPE.TAGGING,
  ) => {
    if (showPolling) {
      setIsPolling(true);
      setPollingMessage(DatasetActionMessages[actionType].IN_PROGRESS);
    }
    setInitiatedActionIds((prev) => [...prev, data.action_id]);
    startPolling({
      fn: () =>
        getActionStatus({ datasetId: id as string, params: { action_ids: [...initiatedActionIds, data.action_id] } }),
      validate: (data: DatasetActionStatusResponseType[]) => {
        return data?.filter((item) => !item.is_completed)?.length === 0;
      },
      interval: 30000,
      maxAttempts: 50,
    })
      .then((response) => {
        if (response?.status === DATASET_ACTION_STATUS.SUCCESSFUL) {
          toast.success(DatasetActionMessages[actionType].SUCCESS);
          tableRef.current?.api?.refreshServerSide();
          refetchFilterConfig();
        } else if (response?.status === DATASET_ACTION_STATUS.FAILED) {
          toast.error(DatasetActionMessages[actionType].ERROR);
        }
      })
      .catch(() => {
        toast.error(DatasetActionMessages[actionType].ERROR);
      })
      .finally(() => {
        setIsPolling(false);
        setPollingMessage('');
      });
  };

  const updateApi = ({
    rowId,
    field,
    newValue,
    operator = CONDITION_OPERATOR_TYPE.EQUAL,
  }: {
    rowId: string | string[];
    field: string;
    newValue: string;
    operator?: CONDITION_OPERATOR_TYPE;
  }) => {
    updateDatasetData({
      datasetId: id as string,
      data: {
        filters: {
          logical_operator: LogicalOperatorType.OperatorLogicalAnd,
          conditions: [
            {
              column: '_zamp_id',
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
      .then((response) => handleSuccessfulUpdate(response, false))
      .catch((err) => {
        captureException(err);
        toast.error(TOAST_MESSAGES.FAILED_DATASET_UPDATE);
      });
  };

  const onCellEditRequest = (event: CellEditRequestEvent) => {
    const { colDef, newValue, data, source, node } = event;
    const { field } = colDef;
    const updatedRow = { ...event.data, [field as string]: newValue };

    // Optimistic update
    node.setData(updatedRow);

    if (source === 'edit') updateApi({ rowId: data?._zamp_id as string, field: field as string, newValue });
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

    if (startIndex > endIndex) {
      loopStartIndex = endIndex;
      loopEndIndex = startIndex;
    }
    for (let i = loopStartIndex; i <= loopEndIndex; i++) {
      const row = tableRef.current?.api?.getDisplayedRowAtIndex(i);

      rowIds.push(row?.data?._zamp_id as string);
      if (i === startIndex) {
        newValue = row?.data?.[field as string] as string;
      }
    }

    updateApi({
      rowId: rowIds,
      field,
      newValue,
      operator: CONDITION_OPERATOR_TYPE.IN,
    });
  };

  const handleDrilldownClick = (data: MapAny) => {
    if (params?.pageId) {
      router.push(getPageDatasetDrilldownRoute(params?.pageId as string, id as string, data?._zamp_id as string));
    } else {
      router.push(getDatasetDrilldownRoute(id as string, data?._zamp_id as string));
    }
  };

  const handleRowPropertiesClick = (data: MapAny) => {
    setRowPropertiesData(data);
  };

  const handleRulesListingSideDrawerOpen = (ruleColumnDetailsValue: RuleColumnDetailsType) => {
    setIsRulesListingSideDrawerOpen(true);
    setRuleColumnDetails(ruleColumnDetailsValue);
  };

  useEffect(() => {
    if (filterConfigData?.data?.length && !isFetching && !isUninitialized) {
      syncFilterConfigHiddenColumnsInLocalStorage(id as string, filterConfigData?.data);

      const columns = formatColumns({
        filterConfig: filterConfigData?.data,
        currentUserHasEditAccess,
        datasetId: id,
        handleSuccessfulUpdate,
        tableRef,
        handleRulesListingSideDrawerOpen,
      });

      if (columns?.length > 0) {
        setColumns(columns);
        const filtersConfig = filterConfigData?.data
          ?.filter((item) => !item?.metadata?.is_hidden)
          ?.map((column) => ({
            key: column.column,
            label: column.alias ?? snakeCaseToSentenceCase(column?.column),
            values: column.options,
            type: column?.metadata?.custom_type === CUSTOM_COLUMNS_TYPE.TAG ? FILTER_TYPES.TAGS : column?.type,
          }));

        dispatch({
          type: filtersContextActions.SET_FILTERS_CONFIG,
          payload: {
            filtersConfig,
          },
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

        if (drilldownFilters) {
          firstLoadDone.current = false;
          const { selectedDrilldownFilters, hiddenDrilldownFilters } = formatDrilldownFilters(
            drilldownFilters,
            filterConfigData?.data,
          );

          if (!checkIsObjectEmpty(hiddenDrilldownFilters)) setHiddenColumnFilters(hiddenDrilldownFilters);
          if (!checkIsObjectEmpty(selectedDrilldownFilters))
            dispatch({
              type: filtersContextActions.INITIALIZE_DEFAULT_FILTERS,
              payload: { selectedFilters: selectedDrilldownFilters },
            });
        }
        if (
          isNoRowsOverlayVisible ||
          (isDatasetArtifact ? datasetArtifacts?.data?.total_count === 0 : datasetData?.data?.total_count === 0) ||
          drilldownFilters?.conditions === null ||
          isReadOnly
        )
          return;
        // Removed because it is causing load on star tree
        // const amountRangeColumns = columns
        //   ?.filter((column) => column?.headerComponentParams?.filterType === FILTER_TYPES.AMOUNT_RANGE)
        //   ?.map((column) => column?.field)
        //   ?.filter((column) => column !== undefined);

        // if (amountRangeColumns?.length > 0) {
        //   getDatasetData({
        //     datasetId: id as string,
        //     query_config: getEncodedRequestWithAggregations(amountRangeColumns),
        //   })
        //     .unwrap()
        //     .then((response) => {
        //       if (!isNoRowsOverlayVisible) {
        //         setColumnLevelStats(formatColumnLevelStats(response?.data?.rows?.[0]));
        //       }
        //     })
        //     .catch(() => {
        //       if (!isNoRowsOverlayVisible) {
        //         setColumnLevelStats(undefined);
        //       }
        //     });
        // }
      }
    }
  }, [filterConfigData?.data, filters, id, drilldownFilters, isFetching, isUninitialized]);

  useEffect(() => {
    tableRef.current?.api?.setFilterModel(selectedFilters);
    updateFiltersInParent?.(selectedFilters);
  }, [selectedFilters, fxCurrency]);

  useEffect(() => {
    if (isNoRowsOverlayVisible) {
      tableRef.current?.api?.showNoRowsOverlay();
    } else {
      tableRef.current?.api?.hideOverlay();
    }
  }, [isNoRowsOverlayVisible]);

  const handleFilterChange = (value: string[]) => {
    setFxCurrency(value);
  };

  const handleRefetchDataset = () => {
    if (isDatasetArtifact) {
      getDatasetArtifacts({
        processId: processId as string,
        activityRunId: activityId as string,
        datasetId: id as string,
        query_config: exportsDatasetQuery,
      });
    } else {
      getDatasetData({
        datasetId: id as string,
        query_config: exportsDatasetQuery,
      });
    }
  };

  const handleColumnMoved = (event: ColumnMovedEvent) => {
    const columnOrderingFromLocalStorage = getColumnOrderingVisibilityForCurrentDataset(id);
    const latestColumns = event?.api?.getColumns() ?? [];
    const { column, toIndex = 0 } = event;

    if (!column) return;
    const columnOrderingVisibility: { colId: string; isVisible: boolean }[] = columnOrderingFromLocalStorage?.length
      ? columnOrderingFromLocalStorage
      : latestColumns.map((column) => ({
          colId: column.getColId(),
          isVisible: column.isVisible(),
        }));

    const movedColumn = columnOrderingVisibility.find((item) => item.colId === column?.getColId()) ?? {};
    const fromIndex = columnOrderingVisibility.findIndex((item) => item.colId === column?.getColId());

    if (fromIndex === toIndex) return;
    let finalList: { colId?: string; isVisible?: boolean }[] = [];

    if (fromIndex < toIndex) {
      const zeroToOldIndex = columnOrderingVisibility.slice(0, fromIndex) ?? [];
      const oldIndexToNewIndex = columnOrderingVisibility.slice(fromIndex + 1, toIndex + 1) ?? [];
      const newIndexToEnd = columnOrderingVisibility.slice(toIndex + 1) ?? [];

      finalList = [...zeroToOldIndex, ...oldIndexToNewIndex, movedColumn, ...newIndexToEnd];
    } else {
      const endToOldIndex = columnOrderingVisibility.slice(fromIndex + 1) ?? [];
      const oldIndexToNewIndex = columnOrderingVisibility.slice(toIndex, fromIndex) ?? [];
      const newIndexToStart = columnOrderingVisibility.slice(0, toIndex) ?? [];

      finalList = [...newIndexToStart, movedColumn, ...oldIndexToNewIndex, ...endToOldIndex];
    }
    const currentColumnOrderingVisibility = JSON.parse(
      getFromLocalStorage(LOCAL_STORAGE_KEYS.COLUMN_ORDERING_VISIBILITY) ?? '{}',
    );

    setToLocalStorage(
      LOCAL_STORAGE_KEYS.COLUMN_ORDERING_VISIBILITY,
      JSON.stringify({ ...currentColumnOrderingVisibility, [id]: finalList }),
    );
  };

  const handleCloseRulesListingSideDrawer = () => {
    setIsRulesListingSideDrawerOpen(false);
  };

  const handleCloseDeleteRule = () => {
    setDeleteRuleId('');
  };

  const handleDeleteRuleSuccess = (data: DatasetUpdateResponseType) => {
    handleCloseRulesListingSideDrawer();
    handleSuccessfulUpdate(data, true, DATASET_ACTION_TYPE.RULE_DELETION);
  };

  useEffect(() => {
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

    if (isDatasetArtifact) {
      getDatasetArtifacts({
        processId: processId as string,
        activityRunId: activityId as string,
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
    } else {
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
    }
  }, [filters, drilldownFilters, id, isDatasetArtifact, getDatasetArtifacts, processId, activityId]);

  useEffect(() => {
    updateDatasetTitleInParent?.(datasetTitle);
  }, [datasetTitle, updateDatasetTitleInParent]);

  useOnClickOutside(datasetTableRef, removeCellFocus);

  return (
    <>
      <CommonWrapper
        className={cn('h-full', {
          'flex flex-col items-center justify-center': isFetching,
        })}
        isLoading={isFetching}
        isError={isError}
        skeletonType={SkeletonTypes.CUSTOM}
        refetchFunction={refetchFilterConfig}
        loader={
          <div className='z-50 flex h-[calc(100vh-200px)] w-full items-center justify-center bg-white'>
            <DynamicLottiePlayer
              src={ZAMP_LOGO_LOADER}
              className='lottie-player h-[140px]'
              autoplay
              loop
              keepLastFrame
            />
          </div>
        }
      >
        <div className={cn('z-1000 flex items-center justify-between gap-y-3 pr-8', headerClassName)}>
          <div className={cn('flex items-center py-3', { 'py-0': isDatasetArtifact })}>
            <FiltersWrapper label='Filter' filterConfig={filtersConfig ?? []} className={filterWrapperClassName} />
          </div>

          <div className='relative flex items-center gap-2.5'>
            {!isReadOnly && <Notification isPolling={isPolling} message={pollingMessage} />}
            {!isReadOnly && (
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
              />
            )}
            {!isReadOnly && showFileImports && (
              <ImportDataset
                onRefetch={handleRefetchDataset}
                setShowAiTransformationStatus={setShowAiTransformationStatus}
              />
            )}
            {!isReadOnly && showDatasetHistory && <DatasetHistory />}
            {!isReadOnly && (
              <>
                <DisplayOptions tableRef={tableRef} datasetId={id as string} />
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

        <CommonWrapper
          isError={isDatasetArtifact ? lazyloadDatasetArtifactsError : lazyloadDataSetError}
          errorCardTitle='Failed to load dataset'
          errorCardSubTitle='Please try again later'
          refetchFunction={handleRefetchDataset}
        >
          <div className='sensitive z-10 h-full w-full' ref={datasetTableRef}>
            <DatasetTable
              tableRef={tableRef}
              columns={columns}
              serverSideDatasource={serverSideDatasource}
              columnConfig={{ enableRowGroup: true, enableValue: true, headerComponent: CustomHeader }}
              totalRows={totalRows}
              onCellEditRequest={onCellEditRequest}
              onFillEnd={onFillEnd}
              onRowPropertiesClick={handleRowPropertiesClick}
              onColumnMoved={handleColumnMoved}
              // Removed because it is causing load on star tree
              // columnLevelStats={columnLevelStats}
              containerStyle={containerStyle}
              gridStyle={gridStyle}
              {...(isDatasetArtifact
                ? datasetArtifacts?.data?.config?.is_drilldown_enabled
                  ? { onDrilldownClick: handleDrilldownClick }
                  : {}
                : datasetData?.data?.config?.is_drilldown_enabled
                  ? { onDrilldownClick: handleDrilldownClick }
                  : {})}
            />
          </div>
        </CommonWrapper>
      </CommonWrapper>
      {isRulesListingSideDrawerOpen && (
        <RulesListingSideDrawer
          column={ruleColumnDetails?.colId}
          columnLabel={ruleColumnDetails?.columnLabel}
          tagColorMap={ruleColumnDetails?.tagColorMap}
          onClose={handleCloseRulesListingSideDrawer}
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
          onClose={handleCloseDeleteRule}
          ruleId={deleteRuleId ?? ''}
          onSuccess={handleDeleteRuleSuccess}
        />
      )}
    </>
  );
};

export default withFiltersContext(DatasetById);
