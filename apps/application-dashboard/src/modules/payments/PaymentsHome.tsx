import React, { FC, useEffect, useMemo, useRef, useState } from 'react';
import {
  ColDef,
  ColumnMovedEvent,
  IServerSideDatasource,
  IServerSideGetRowsParams,
  IServerSideGetRowsRequest,
  RowClickedEvent,
} from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { useGetPaymentListDatasetFilterConfigQuery, useLazyGetPaymentListQuery } from 'apis/payments';
import { COLORS } from 'constants/colors';
import { ZAMP_LOGO_LOADER } from 'constants/lottie/zamp-logo-loader';
import { useAppDispatch, useAppSelector } from 'hooks/toolkit';
import TableSchemaAlignmentStatus from 'modules/data/components/importDataset/TableSchemaAlignmentStatus';
import { LOADER_STATUS } from 'modules/data/data.types';
import { formatColumns, getColumnOrderingVisibilityForCurrentDataset, getFilters } from 'modules/data/data.utils';
import RowPropertiesSideDrawer from 'modules/data/RowProperties';
import MoveMoneyButton from 'modules/payments/move-money/components/MoveMoneyButton';
import RecipientsSideDrawer from 'modules/payments/recipients/RecipientsSidedrawer';
import { useResourceAccess } from 'modules/shareResource/hooks/useResourceAccess';
import { PAYMENT_ACCESS_PRIVILEGES, ResourceType } from 'modules/shareResource/shareResource.types';
import { useSearchParams } from 'next/navigation';
import { RootState } from 'store';
import { addBreadcrumb } from 'store/slices/layout-configs';
import { DatasetDataResponseType } from 'types/api/dataset.types';
import { SIZE_TYPES } from 'types/common/components';
import { defaultFn, MapAny } from 'types/commonTypes';
import { cn } from 'utils/common';
import { getFromLocalStorage, LOCAL_STORAGE_KEYS, setToLocalStorage } from 'utils/localstorage';
import PaymentDetailsSideDrawer from '@/modules/payments/payment-details/PaymentDetailsSideDrawer';
import TemplateListSideDrawer from '@/modules/payments/templates/TemplateListSideDrawer';
import TooltipButton from 'components/common/button/TooltipButton';
import CustomHeader from 'components/common/table/CustomHeader';
import DatasetTable from 'components/common/table/DatasetTable';
import DisplayOptions from 'components/common/table/DisplayOptions';
import { getEncodedRequest } from 'components/common/table/table.utils';
import { TooltipPositions } from 'components/common/tooltip';
import CommonWrapper from 'components/commonWrapper';
import { SkeletonTypes } from 'components/commonWrapper/commonWrapper.types';
import DynamicLottiePlayer from 'components/DynamicLottiePlayer';
import FiltersWrapper from 'components/filter/filterMenu/FiltersWrapper';
import { CONDITION_OPERATOR_TYPE } from 'components/filter/filters.constants';
import { filtersContextActions, useFiltersContextStore, withFiltersContext } from 'components/filter/filters.context';

type PaymentsListProps = {
  id: string;
  zampIds?: string[];
};

const PaymentsList: FC<PaymentsListProps> = ({ id, zampIds }) => {
  const tableRef = useRef<AgGridReact>(null);
  const datasetTableRef = useRef<HTMLDivElement>(null);
  const firstLoadDone = useRef(false); // Track if first load is done

  const filters = useSearchParams().get('filters');
  const appDispatch = useAppDispatch();
  const breadcrumbStack = useAppSelector((state: RootState) => state.layoutConfig.breadcrumbStack);

  const { checkUserPrivilege } = useResourceAccess(ResourceType.PAYMENTS, '');

  const {
    dispatch,
    state: { selectedFilters, filtersConfig },
  } = useFiltersContextStore();

  const [columns, setColumns] = useState<ColDef[]>([]);
  const [totalRows, setTotalRows] = useState<number>(0);
  const [rowPropertiesData, setRowPropertiesData] = useState<MapAny>();
  const [datasetTitle, setDatasetTitle] = useState<string>('');
  const [isNoRowsOverlayVisible, setIsNoRowsOverlayVisible] = useState<boolean>(false);
  const [cachedDatasetData, setCachedDatasetData] = useState<DatasetDataResponseType>();
  const [isRecipientsSideDrawerOpen, setIsRecipientsSideDrawerOpen] = useState<boolean>(false);
  const [isPaymentTemplatesSideDrawerOpen, setIsPaymentTemplatesSideDrawerOpen] = useState<boolean>(false);
  const [paymentDetailsId, setPaymentDetailsId] = useState<string>('');
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

  const [getPaymentList, { data: paymentListData }] = useLazyGetPaymentListQuery();
  const {
    data: filterConfigData,
    refetch: refetchFilterConfig,
    isFetching,
    isError,
  } = useGetPaymentListDatasetFilterConfigQuery();
  const filterConfig = filterConfigData;

  const serverSideDatasource: IServerSideDatasource = useMemo(() => {
    return {
      getRows: (parameters: IServerSideGetRowsParams): void => {
        const filtersFromZampIds = {
          column: '_zamp_id',
          operator: CONDITION_OPERATOR_TYPE.IN,
          value: zampIds,
        };
        const queryConfig = getEncodedRequest(
          parameters.request,
          '',
          false,
          false,
          false,
          zampIds && zampIds?.length > 0 ? filtersFromZampIds : undefined,
        );

        if (!firstLoadDone.current && cachedDatasetData && cachedDatasetData?.data?.rows?.length > 0) {
          // Use Cached Data for First Load
          firstLoadDone.current = true; // Mark first load as done
          parameters.success({
            rowData: cachedDatasetData?.data?.rows,
            ...(parameters.request.startRow === 0 ? { rowCount: cachedDatasetData?.data?.total_count } : {}),
          });
        } else {
          getPaymentList({
            query_config: queryConfig,
          })
            .unwrap()
            .then((response) => {
              if (parameters.request.startRow === 0) {
                setDatasetTitle(response?.title);
                setTotalRows(response?.data?.total_count);
                setIsNoRowsOverlayVisible(response?.data?.total_count === 0);
                dispatch({
                  type: filtersContextActions.SET_TOTAL_ROWS,
                  payload: { totalRows: response?.data?.total_count },
                });
              }
              parameters.success({
                rowData: response?.data?.rows,
                ...(parameters.request.startRow === 0 ? { rowCount: response?.data?.total_count } : {}),
              });
            })
            .catch(() => {
              parameters.fail();
            });
        }
      },
    };
  }, [getPaymentList, id, zampIds, cachedDatasetData]);

  const handleRowClicked = (event: RowClickedEvent) => {
    setPaymentDetailsId(event?.data?.payment_id);
    // console.log('event', event.payment_id);
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

  useEffect(() => {
    if (filterConfig?.length) {
      const columns = formatColumns(filterConfig, false, id as string, undefined, tableRef, defaultFn);

      if (columns?.length > 0) {
        setColumns(columns);
        dispatch({
          type: filtersContextActions.SET_FILTERS_CONFIG,
          payload: {
            filtersConfig: filterConfig
              ?.filter((item) => !item?.metadata?.is_hidden)
              ?.map((column) => ({
                key: column.column,
                label: column.column,
                values: column.options,
                type: column.type,
              })),
          },
        });
        if (filters)
          dispatch({
            type: filtersContextActions.INITIALIZE_DEFAULT_FILTERS,
            payload: { selectedFilters: getFilters(filters, filterConfig) ?? {} },
          });
      }
    }
  }, [filterConfig, filters, id]);

  useEffect(() => {
    tableRef.current?.api?.setFilterModel(selectedFilters);
  }, [selectedFilters]);

  useEffect(() => {
    if (isNoRowsOverlayVisible) {
      tableRef.current?.api?.showNoRowsOverlay();
    } else {
      tableRef.current?.api?.hideOverlay();
    }
  }, [isNoRowsOverlayVisible]);

  useEffect(() => {
    if (datasetTitle && breadcrumbStack?.length === 0) {
      appDispatch(addBreadcrumb([datasetTitle]));
    }
  }, [datasetTitle, breadcrumbStack]);

  useEffect(() => {
    if (filters) return;
    const filtersFromZampIds = {
      column: '_zamp_id',
      operator: CONDITION_OPERATOR_TYPE.IN,
      value: zampIds,
    };
    const queryConfig = getEncodedRequest(
      {} as IServerSideGetRowsRequest,
      '',
      false,
      false,
      false,
      zampIds && zampIds?.length > 0 ? filtersFromZampIds : undefined,
    );

    getPaymentList({
      query_config: queryConfig,
    })
      .unwrap()
      .then((response) => {
        setDatasetTitle(response?.title);
        setTotalRows(response?.data?.total_count);
        setIsNoRowsOverlayVisible(response?.data?.total_count === 0);
        setCachedDatasetData(response);
        dispatch({
          type: filtersContextActions.SET_TOTAL_ROWS,
          payload: { totalRows: response?.data?.total_count },
        });
      });
  }, [filters]);

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
          <div className='flex justify-center items-center h-[calc(100vh-200px)] w-full z-50 bg-white'>
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
        <div className='flex items-center justify-between pr-8'>
          <div className='flex items-center py-3'>
            <FiltersWrapper label='Filter' filterConfig={filtersConfig ?? []} />
          </div>
          <div className='relative flex items-center gap-3'>
            <TooltipButton
              id='export-dataset'
              onClick={() => setPaymentDetailsId('')}
              tooltipBody='Payment Details'
              className='border-none'
              tooltipClassName='!z-1000'
              tooltipColor={COLORS.BLACK}
              buttonSize={SIZE_TYPES.XSMALL}
              tooltipPosition={TooltipPositions.TOP}
              buttonIcon={{
                id: 'user-up-01',
                size: 14,
              }}
            />
            <TooltipButton
              id='export-dataset'
              onClick={() => setIsRecipientsSideDrawerOpen(true)}
              tooltipBody='Recipients'
              className='border-none'
              tooltipClassName='!z-1000'
              tooltipColor={COLORS.BLACK}
              buttonSize={SIZE_TYPES.XSMALL}
              tooltipPosition={TooltipPositions.TOP}
              buttonIcon={{
                id: 'user-up-01',
                size: 14,
              }}
            />

            <TooltipButton
              id='payment-templates'
              onClick={() => setIsPaymentTemplatesSideDrawerOpen(true)}
              tooltipBody='Payment Templates'
              className='border-none !z-1000'
              tooltipClassName='!z-1000'
              tooltipColor={COLORS.BLACK}
              buttonSize={SIZE_TYPES.XSMALL}
              tooltipPosition={TooltipPositions.TOP}
              buttonIcon={{
                id: 'file-05',
                size: 14,
              }}
            />

            <TableSchemaAlignmentStatus
              showAiTransformationStatus={showAiTransformationStatus}
              setShowAiTransformationStatus={setShowAiTransformationStatus}
            />
            <DisplayOptions tableRef={tableRef} datasetId={id as string} />

            {(checkUserPrivilege(PAYMENT_ACCESS_PRIVILEGES.ADMIN) ||
              checkUserPrivilege(PAYMENT_ACCESS_PRIVILEGES.INITIATOR)) && <MoveMoneyButton />}
          </div>
        </div>

        <div className='z-10 w-full h-full' ref={datasetTableRef}>
          <DatasetTable
            tableRef={tableRef}
            columns={columns}
            serverSideDatasource={serverSideDatasource}
            columnConfig={{ enableRowGroup: true, enableValue: true, headerComponent: CustomHeader }}
            totalRows={totalRows}
            onColumnMoved={handleColumnMoved}
            onRowClicked={handleRowClicked}
          />
        </div>
      </CommonWrapper>

      {rowPropertiesData && (
        <RowPropertiesSideDrawer
          data={rowPropertiesData}
          onClose={() => setRowPropertiesData(undefined)}
          datasetId={id as string}
          isDrillDownEnabled={paymentListData?.data?.config?.is_drilldown_enabled}
          columns={columns}
        />
      )}
      {isRecipientsSideDrawerOpen && (
        <RecipientsSideDrawer isOpen={isRecipientsSideDrawerOpen} onClose={setIsRecipientsSideDrawerOpen} />
      )}
      {isPaymentTemplatesSideDrawerOpen && (
        <TemplateListSideDrawer
          isOpen={isPaymentTemplatesSideDrawerOpen}
          onClose={() => setIsPaymentTemplatesSideDrawerOpen(false)}
        />
      )}
      {paymentDetailsId && (
        <PaymentDetailsSideDrawer paymentDetailsId={paymentDetailsId} onClose={() => setPaymentDetailsId('')} />
      )}
    </>
  );
};

export default withFiltersContext(PaymentsList);
