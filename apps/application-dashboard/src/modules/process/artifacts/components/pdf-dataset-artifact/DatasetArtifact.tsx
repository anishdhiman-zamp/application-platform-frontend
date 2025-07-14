'use client';

import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { captureException } from '@sentry/browser';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import {
  CellEditRequestEvent,
  ColDef,
  FillEndEvent,
  IServerSideDatasource,
  IServerSideGetRowsParams,
  IServerSideGetRowsRequest,
} from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import {
  useGetDatasetFilterConfigQuery,
  useLazyGetActionStatusQuery,
  useUpdateDatasetDataMutation,
} from 'apis/dataset';
import { COLORS } from 'constants/colors';
import { ZAMP_LOGO_LOADER } from 'constants/lottie/zamp-logo-loader';
import { useOnClickOutside } from 'hooks';
import usePolling from 'hooks/usePolling';
import ExportDataset from 'modules/data/components/exportDataset';
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
  getFilters,
  handleApiError,
  handleColumnMoved,
  handleDrilldownClick,
  removeCellFocus,
  syncFilterConfigHiddenColumnsInLocalStorage,
} from 'modules/data/data.utils';
import Notification from 'modules/data/Notification';
import RowPropertiesSideDrawer from 'modules/data/RowProperties';
import RulesListingSideDrawer from 'modules/data/RulesListing';
import RuleDelete from 'modules/data/RulesListing/RuleDelete';
import { LOCAL_CURRENCY, PAGE_CURRENCY_OPTIONS } from 'modules/page/pages.constants';
import { DATASET_ACCESS_PRIVILEGES, ResourceType } from 'modules/shareResource/shareResource.types';
import SingleSelectFilter from 'modules/widgets/components/SingleSelectFilter';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  DatasetActionStatusResponseType,
  DatasetDataResponseType,
  DatasetUpdateResponseType,
} from 'types/api/dataset.types';
import { type defaultFnType, MapAny } from 'types/commonTypes';
import { FilterModelType, LogicalOperatorType } from 'types/components/table.type';
import { checkIsObjectEmpty, cn, formatPlural, snakeCaseToSentenceCase } from 'utils/common';
import { useLazyGetDatasetArtifactsQuery } from '@/apis/processes';
import { CUSTOM_COLUMNS_TYPE } from '@/components/common/table/table.types';
import { FILTER_TYPES } from '@/components/filter/filter.types';
import { useResourceAccess } from '@/hooks/useResourceAccess';
import {
  type CompletedField,
  CompletedFieldsActions,
  useCompletedFields,
} from '@/modules/process/artifacts/context/completedFields.context';
import { isValueEmpty } from '@/modules/widgets/TreeTable/utils';
import type { MissingFieldItemType } from '@/types/api/processApi.types';
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
  pageSize?: number;
  isReadOnly?: boolean;
  containerStyle?: MapAny;
  updateFiltersInParent?: (filters: MapAny) => void;
  updateFilterConfigInParent?: (filterConfig: MapAny[]) => void;
  parentSelectedFilters?: MapAny;
  missingFields?: MissingFieldItemType[];
  requiredMissingFields?: MissingFieldItemType[];
  hasMissingFields?: boolean;
};

type MissingFieldControlProps = {
  totalMissingFields: number;
  currentIndex: number;
  completedFields: CompletedField[];
  goPrevious: defaultFnType;
  goNext: defaultFnType;
};

const DatasetArtifact: FC<DatasetByIdProps> = ({
  id,
  drilldownFilters,
  pageSize,
  isReadOnly = false,
  containerStyle,
  updateFiltersInParent,
  updateFilterConfigInParent,
  parentSelectedFilters,
  missingFields,
  requiredMissingFields,
  hasMissingFields,
}) => {
  const searchParams = useSearchParams();
  const params = useParams();
  const filters = decodeURIComponent(searchParams?.get('filters') ?? '');
  const processId = params?.processId as string;
  const activityId = params?.activityId;
  const currency = searchParams?.get('currency') ?? LOCAL_CURRENCY;
  const router = useRouter();
  const tableRef = useRef<AgGridReact>(null);
  const datasetTableRef = useRef<HTMLDivElement>(null);
  const firstLoadDone = useRef(false);

  const { checkUserPrivilege } = useResourceAccess({
    resourceType: ResourceType.DATASET,
    resourceId: id,
  });

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
      refetchOnMountOrArgChange: false,
    },
  );

  const [getActionStatus] = useLazyGetActionStatusQuery();
  const [getDatasetArtifacts, { data: datasetArtifacts, isError: lazyloadDatasetArtifactsError }] =
    useLazyGetDatasetArtifactsQuery();

  const {
    dispatch,
    state: { selectedFilters, filtersConfig },
  } = useFiltersContextStore();

  const {
    state: { completedFields },
    dispatch: completedFieldsDispatch,
  } = useCompletedFields();

  const { startPolling } = usePolling();

  const currentUserHasEditAccess = useMemo(() => {
    return (
      checkUserPrivilege(DATASET_ACCESS_PRIVILEGES.ADMIN) || checkUserPrivilege(DATASET_ACCESS_PRIVILEGES.DATA_EDITOR)
    );
  }, [checkUserPrivilege]);

  const currentDatasetCompletedFields = useMemo(() => {
    return completedFields[id]?.filter((field) => field.isRequired) ?? [];
  }, [completedFields, id]);

  const [gridReady, setGridReady] = useState<boolean>(false);
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
  const [fxCurrency, setFxCurrency] = useState<string[]>([currency]);
  const [initiatedActionIds, setInitiatedActionIds] = useState<string[]>([]);
  const [isNoRowsOverlayVisible, setIsNoRowsOverlayVisible] = useState<boolean>(false);
  const [cachedDatasetData, setCachedDatasetData] = useState<DatasetDataResponseType>();
  const [hiddenColumnFilters, setHiddenColumnFilters] = useState<MapAny>();
  const [deleteRuleId, setDeleteRuleId] = useState<string>();
  const [pollingMessage, setPollingMessage] = useState<string>('');
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
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
  const [isInitialDataLoaded, setIsInitialDataLoaded] = useState<boolean>(false);

  const [updateDatasetData] = useUpdateDatasetDataMutation();

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

        removeCellFocus(tableRef);
        setExportsDatasetQuery(queryConfig);
        if (!firstLoadDone.current || isDefaultFilters) {
          // Use Cached Data for First Load
          firstLoadDone.current = true; // Mark first load as done
          if (drilldownFilters?.conditions === null) {
            setIsNoRowsOverlayVisible(true);
            setIsInitialDataLoaded(true); // Mark data as loaded even for empty results
            parameters.success({
              rowData: [],
              rowCount: 0,
            });
          } else if (!checkIsObjectEmpty(cachedDatasetData)) {
            const totalCount = cachedDatasetData?.data?.total_count ?? 0;

            setIsNoRowsOverlayVisible(totalCount === 0);
            setIsInitialDataLoaded(true); // Mark data as loaded
            parameters.success({
              rowData: cachedDatasetData?.data?.rows ?? [],
              ...(parameters.request.startRow === 0 ? { rowCount: totalCount } : {}),
            });
          }
        } else {
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
                setTotalRows(totalCount);
                setIsNoRowsOverlayVisible(totalCount === 0);
                setIsInitialDataLoaded(true); // Mark data as loaded
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
              setIsInitialDataLoaded(true); // Mark data as loaded even on error
              parameters.fail();
            });
        }
      },
    };
  }, [id, fxCurrency, cachedDatasetData, drilldownFilters, getDatasetArtifacts, processId, activityId, pageSize]);

  const handleSuccessfulUpdate = (
    data: DatasetUpdateResponseType,
    showPolling = true,
    actionType = DATASET_ACTION_TYPE.UPDATE_MISSING_FIELD,
    rowId: string | string[] = '',
    columnId = '',
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
          handleUpdateCompletedFields(rowId, columnId);
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

  const handleUpdateCompletedFields = (rowId: string | string[], columnId: string) => {
    toast.success(DatasetActionMessages[DATASET_ACTION_TYPE.UPDATE_MISSING_FIELD].SUCCESS);
    tableRef.current?.api?.refreshServerSide();

    if (Array.isArray(rowId)) {
      rowId.forEach((id) => {
        completedFieldsDispatch({
          type: CompletedFieldsActions.ADD_COMPLETED_FIELD,
          payload: {
            datasetId: id as string,
            field: {
              rowId: id,
              columnId,
              isRequired:
                requiredMissingFields?.find((field) => field.id === id && field.column === columnId)?.is_required ??
                false,
            },
          },
        });
      });
    } else {
      completedFieldsDispatch({
        type: CompletedFieldsActions.ADD_COMPLETED_FIELD,
        payload: {
          datasetId: id as string,
          field: {
            rowId: rowId as string,
            columnId,
            isRequired:
              requiredMissingFields?.find((field) => field.id === rowId && field.column === columnId)?.is_required ??
              false,
          },
        },
      });
    }
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
              column: 'id',
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
      .then((response) => {
        if (response?.status === DATASET_ACTION_STATUS.SUCCESSFUL) {
          handleUpdateCompletedFields(rowId, field);
        } else {
          handleSuccessfulUpdate(response, false, DATASET_ACTION_TYPE.UPDATE_MISSING_FIELD, rowId, field);
        }
      })
      .catch((err) => {
        handleApiError(err);
      });
  };

  const onCellEditRequest = (event: CellEditRequestEvent) => {
    const { colDef, newValue, data, source, node } = event;
    const { field } = colDef;
    const oldValue = data?.[field as string];
    const value = isValueEmpty(newValue) ? (typeof oldValue === 'number' ? 0 : '-') : newValue;
    const updatedRow = { ...event.data, [field as string]: value };

    // Optimistic update
    node.setData(updatedRow);

    if (source === 'commit')
      updateApi({
        rowId: data?.id as string,
        field: field as string,
        newValue: value,
      });
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

  const handleRulesListingSideDrawerOpen = (ruleColumnDetailsValue: RuleColumnDetailsType) => {
    setIsRulesListingSideDrawerOpen(true);
    setRuleColumnDetails(ruleColumnDetailsValue);
  };

  const handleRefetchDataset = () => {
    getDatasetArtifacts({
      processId: processId as string,
      activityRunId: activityId as string,
      datasetId: id as string,
      query_config: exportsDatasetQuery,
    });
  };

  const handleDeleteRuleSuccess = (data: DatasetUpdateResponseType) => {
    setIsRulesListingSideDrawerOpen(false);
    handleSuccessfulUpdate(data, true, DATASET_ACTION_TYPE.RULE_DELETION);
  };

  const scrollToMissingField = (index: number) => {
    const { id, column } = requiredMissingFields?.[index] ?? {};

    if (!id || !column) return;

    const api = tableRef.current?.api;
    const rowNode = api?.getRowNode(id);

    if (rowNode) {
      api?.ensureNodeVisible(rowNode);
      api?.ensureColumnVisible(column, 'middle');
      api?.setFocusedCell(rowNode?.rowIndex as number, column);
    }
  };

  const goNext = () => {
    if (currentIndex < (requiredMissingFields?.length ?? 0) - 1) {
      setCurrentIndex((prev) => {
        const next = prev + 1;

        scrollToMissingField(next);

        return next;
      });
    }
  };

  const goPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => {
        const next = prev - 1;

        scrollToMissingField(next);

        return next;
      });
    }
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
        missingFields,
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
          datasetArtifacts?.data?.total_count === 0 ||
          drilldownFilters?.conditions === null ||
          isReadOnly
        )
          return;
      }
    }
  }, [
    filterConfigData?.data,
    filters,
    id,
    drilldownFilters,
    isFetching,
    isUninitialized,
    missingFields,
    currentUserHasEditAccess,
  ]);

  useEffect(() => {
    if (gridReady && selectedFilters) {
      tableRef.current?.api?.setFilterModel(selectedFilters);
      updateFiltersInParent?.(selectedFilters);
    }
  }, [selectedFilters, fxCurrency, gridReady]);

  useEffect(() => {
    if (isNoRowsOverlayVisible) {
      tableRef.current?.api?.showNoRowsOverlay();
    } else {
      tableRef.current?.api?.hideOverlay();
    }
  }, [isNoRowsOverlayVisible]);

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

    getDatasetArtifacts({
      processId: processId as string,
      activityRunId: activityId as string,
      datasetId: id as string,
      query_config: queryConfig,
    })
      .unwrap()
      .then((response) => {
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
  }, [filters, drilldownFilters, id, getDatasetArtifacts, processId, activityId]);

  useEffect(() => {
    if (gridReady && isInitialDataLoaded && hasMissingFields && currentIndex === -1) {
      //requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        setCurrentIndex(0);
        scrollToMissingField(0);
      });
    }
  }, [gridReady, isInitialDataLoaded, hasMissingFields, requiredMissingFields, currentIndex]);

  useOnClickOutside(datasetTableRef, () => removeCellFocus(tableRef));

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
        <div className={cn('flex flex-wrap items-center justify-between gap-y-3 px-4 py-3 pr-8')}>
          <div className='flex items-center py-0'>
            <FiltersWrapper label='Filter' filterConfig={filtersConfig ?? []} className='pl-0' />
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
            {!isReadOnly && (
              <>
                <DisplayOptions tableRef={tableRef} datasetId={id as string} />
                {filterConfigData?.config?.is_fx_enabled && (
                  <div className='flex items-center gap-2'>
                    <div className='border-GRAY_400 h-7 border-r'></div>
                    <SingleSelectFilter
                      onFilterChange={(value) => setFxCurrency(value)}
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
          isError={lazyloadDatasetArtifactsError}
          errorCardTitle='Failed to load dataset'
          errorCardSubTitle='Please try again later'
          refetchFunction={handleRefetchDataset}
        >
          <div className='sensitive relative z-10 h-full w-full' ref={datasetTableRef}>
            <DatasetTable
              tableRef={tableRef}
              columns={columns}
              serverSideDatasource={serverSideDatasource}
              columnConfig={{ enableRowGroup: true, enableValue: true, headerComponent: CustomHeader }}
              totalRows={totalRows}
              onCellEditRequest={onCellEditRequest}
              onFillEnd={onFillEnd}
              onRowPropertiesClick={(data) => setRowPropertiesData(data)}
              onColumnMoved={(event) => handleColumnMoved(event, id as string)}
              onGridReady={() => setGridReady(true)}
              containerStyle={containerStyle}
              missingFields={requiredMissingFields}
              completedFields={currentDatasetCompletedFields}
              gridStyle={hasMissingFields ? { height: 'calc(100vh - 245px)' } : { height: 'calc(100vh - 210px)' }}
              {...(datasetArtifacts?.data?.config?.is_drilldown_enabled
                ? {
                    onDrilldownClick: (data) =>
                      handleDrilldownClick(data, id as string, params?.pageId as string, router),
                  }
                : {})}
            />
          </div>
          {gridReady && hasMissingFields && (
            <MissingFieldControl
              totalMissingFields={requiredMissingFields?.length ?? 0}
              currentIndex={currentIndex}
              completedFields={currentDatasetCompletedFields}
              goPrevious={goPrevious}
              goNext={goNext}
            />
          )}
        </CommonWrapper>
      </CommonWrapper>
      {isRulesListingSideDrawerOpen && (
        <RulesListingSideDrawer
          column={ruleColumnDetails?.colId}
          columnLabel={ruleColumnDetails?.columnLabel}
          tagColorMap={ruleColumnDetails?.tagColorMap}
          onClose={() => setIsRulesListingSideDrawerOpen(false)}
          datasetId={id as string}
          handleSuccessfulUpdate={handleSuccessfulUpdate}
          onDeleteRuleId={() => setDeleteRuleId('')}
        />
      )}
      {rowPropertiesData && (
        <RowPropertiesSideDrawer
          data={rowPropertiesData}
          onClose={() => setRowPropertiesData(undefined)}
          datasetId={id as string}
          isDrillDownEnabled={datasetArtifacts?.data?.config?.is_drilldown_enabled}
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
    </>
  );
};

export default withFiltersContext(DatasetArtifact);

const MissingFieldControl: FC<MissingFieldControlProps> = ({
  totalMissingFields,
  currentIndex,
  completedFields,
  goPrevious,
  goNext,
}) => {
  const remainingFields = useMemo(() => {
    return totalMissingFields - completedFields?.length;
  }, [totalMissingFields, completedFields]);

  return (
    <div className='animate-opacity border-GRAY_500 absolute bottom-10 left-1/2 z-10 flex -translate-x-1/2 transform items-center justify-center rounded-md border-[0.5px] bg-white'>
      <div className='flex items-center gap-x-2.5 p-2.5'>
        <span className='f-11-500 text-RED_800 whitespace-nowrap select-none'>
          {formatPlural(remainingFields, 'missing field')}
        </span>
        <div className='flex items-center gap-x-1.5'>
          <SvgSpriteLoader
            id='chevron-up'
            color={COLORS.GRAY_900}
            size={12}
            onClick={goPrevious}
            className={currentIndex <= 0 ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
          />
          <span className='f-11-500 text-GRAY_700 whitespace-nowrap select-none'>
            {currentIndex === -1 ? 0 : currentIndex + 1}/{totalMissingFields}
          </span>
          <SvgSpriteLoader
            id='chevron-down'
            color={COLORS.GRAY_900}
            size={12}
            onClick={goNext}
            className={currentIndex >= totalMissingFields - 1 ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
          />
        </div>
      </div>
    </div>
  );
};
