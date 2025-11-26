'use client';

import { useGetAllDatasetsQuery } from '@/apis/admin';
import ImageLoader from '@/components/common/loader/ImageLoader';
import { ZAMP_LOGO_LOADER_SVG } from '@/constants/icons';
import { ROUTES_PATH } from '@/constants/routeConfig';
import { ADMIN_DATASET_LISTING_COLUMNS } from '@/deprecated/modules/admin/admin.constants';
import { AdminDeleteDatasetDetailsType, EditDatasetType } from '@/deprecated/modules/admin/admin.types';
import AdminDatasetActions from '@/deprecated/modules/admin/AdminDatasetActions';
import AdminDatasetDelete from '@/deprecated/modules/admin/AdminDatasetDelete';
import AdminDatasetTransform from '@/deprecated/modules/admin/AdminDatasetTransform';
import CreateDataset from '@/deprecated/modules/admin/CreateDataset';
import { ColDef } from 'ag-grid-community';
import { useLazyGetActionStatusQuery } from 'apis/dataset';
import { Button } from 'components/common/button/Button';
import DataTable from 'components/common/table/DataTable';
import { toast } from 'components/common/toast/Toast';
import { TOAST_MESSAGES } from 'components/common/toast/toast.constants';
import CommonWrapper from 'components/commonWrapper';
import { SkeletonTypes } from 'components/commonWrapper/commonWrapper.types';
import { POLLING_STATUS } from 'constants/common.constants';
import usePolling from 'hooks/usePolling';
import Notification from 'modules/data/Notification';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { CreateDatasetResponseType, TransformDatasetResponseType } from 'types/api/admin.types';
import { DatasetActionStatusResponseType } from 'types/api/dataset.types';
import { SIZE_TYPES } from 'types/common/components';

const AdminDatasetListing = () => {
  const { data, isLoading, isError, refetch } = useGetAllDatasetsQuery();
  const [getActionStatus] = useLazyGetActionStatusQuery();

  const [isCreateDatasetOpen, setIsCreateDatasetOpen] = useState(false);
  const [deleteDataset, setDeleteDataset] = useState<AdminDeleteDatasetDetailsType>();
  const [isCreateTransformationOpen, setIsCreateTransformationOpen] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [pollingMessage, setPollingMessage] = useState('');
  const [editDataset, setEditDataset] = useState<EditDatasetType>();

  const { startPolling } = usePolling();

  const handleDeleteDataset = (deleteDataset: AdminDeleteDatasetDetailsType) => {
    setDeleteDataset(deleteDataset);
  };

  const handleCreateTransformation = () => {
    setIsCreateTransformationOpen(true);
  };

  const handleCreateDataset = () => {
    setIsCreateDatasetOpen(true);
  };

  const handleSuccessfulCreateDataset = (data: CreateDatasetResponseType) => {
    setIsPolling(true);
    setPollingMessage('Dataset creation in progress');
    startPolling({
      fn: () => getActionStatus({ datasetId: data.dataset_id as string, params: { action_ids: [data.action_id] } }),
      validate: (data: DatasetActionStatusResponseType[]) => {
        return data.filter((item) => !item.is_completed)?.length === 0;
      },
      interval: 30000,
      maxAttempts: 50,
    })
      .then((data) => {
        if (data?.[0]?.status === POLLING_STATUS.SUCCESSFUL) {
          toast.success(TOAST_MESSAGES.SUCCESS_DATASET_CREATED);
          refetch();
        } else {
          toast.error(TOAST_MESSAGES.ERROR_DATASET_CREATION_FAILED);
        }
      })
      .catch(() => {
        toast.error(TOAST_MESSAGES.ERROR_DATASET_CREATION_FAILED);
      })
      .finally(() => {
        setIsPolling(false);
      });
  };

  const handleSuccessfulCreateTransformation = (data: TransformDatasetResponseType) => {
    setIsPolling(true);
    setPollingMessage('Transformation in progress');
    startPolling({
      fn: () => getActionStatus({ datasetId: data.dataset_id as string, params: { action_ids: [data.action_id] } }),
      validate: (data: DatasetActionStatusResponseType[]) => {
        return data.filter((item) => !item.is_completed)?.length === 0;
      },
      interval: 30000,
      maxAttempts: 50,
    })
      .then((data) => {
        setIsPolling(false);
        if (data?.[0]?.status === POLLING_STATUS.SUCCESSFUL) {
          toast.success(TOAST_MESSAGES.SUCCESS_TRANSFORMATION_CREATED);
          refetch();
        } else {
          toast.error(TOAST_MESSAGES.ERROR_TRANSFORMATION_CREATION_FAILED);
        }
      })
      .catch(() => {
        toast.error(TOAST_MESSAGES.ERROR_TRANSFORMATION_CREATION_FAILED);
      })
      .finally(() => {
        setIsPolling(false);
      });
  };

  const handleEditDataset = (dataset: EditDatasetType) => {
    setEditDataset(dataset);
    setIsCreateDatasetOpen(true);
  };

  const handleCloseCreateDataset = () => {
    setIsCreateDatasetOpen(false);
    setEditDataset(undefined);
  };

  const columns: ColDef[] = useMemo(
    () => [
      ...ADMIN_DATASET_LISTING_COLUMNS,
      {
        field: '',
        headerName: '',
        cellRenderer: AdminDatasetActions,
        cellRendererParams: {
          onDelete: handleDeleteDataset,
          onEditDataset: handleEditDataset,
        },
        sortable: false,
        filter: false,
      },
    ],
    [],
  );

  return (
    <>
      <div className='space-y-4'>
        <div className='f-20-600 text-GRAY_1000 flex items-center justify-between px-4 pt-4'>
          <div>Datasets</div>
          <div className='flex items-center gap-4'>
            <Notification isPolling={isPolling} message={pollingMessage} />
            <Link href={ROUTES_PATH.ADMIN_DATASETS_DAG}>
              <Button id='show-dag' size={SIZE_TYPES.SMALL}>
                Show Dag
              </Button>
            </Link>
            <Button id='create-transformation' size={SIZE_TYPES.SMALL} onClick={handleCreateTransformation}>
              Create Transformation
            </Button>
            <Button id='create-dataset' size={SIZE_TYPES.SMALL} onClick={handleCreateDataset}>
              Create Dataset
            </Button>
          </div>
        </div>
        <CommonWrapper
          isLoading={isLoading}
          isError={isError}
          skeletonType={SkeletonTypes.CUSTOM}
          refetchFunction={refetch}
          className='h-full w-full'
          loader={
            <ImageLoader
              imageSrc={ZAMP_LOGO_LOADER_SVG}
              width={140}
              height={140}
              className='z-50 flex h-[calc(100vh-200px)]'
            />
          }
        >
          <DataTable
            columns={columns}
            rows={data?.datasets ?? []}
            gridStyle={{ height: 'calc(100vh - 110px)', width: '100%' }}
          />
        </CommonWrapper>
      </div>
      {isCreateDatasetOpen && (
        <CreateDataset
          onClose={handleCloseCreateDataset}
          isOpen={isCreateDatasetOpen}
          onSuccessfulCreate={handleSuccessfulCreateDataset}
          editDataset={editDataset}
        />
      )}
      {isCreateTransformationOpen && (
        <AdminDatasetTransform
          isOpen={isCreateTransformationOpen}
          onClose={() => setIsCreateTransformationOpen(false)}
          onSuccessfulTransform={handleSuccessfulCreateTransformation}
        />
      )}
      {deleteDataset && (
        <AdminDatasetDelete
          isOpen={!!deleteDataset}
          onClose={() => setDeleteDataset(undefined)}
          datasetDetails={deleteDataset}
        />
      )}
    </>
  );
};

export default AdminDatasetListing;
