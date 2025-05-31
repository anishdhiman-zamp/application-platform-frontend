'use client';

import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { type Edge, type Node, ReactFlow, useEdgesState, useNodesState, useReactFlow } from '@xyflow/react';
import { useGetAllDatasetsQuery, useGetDatasetDagQuery } from 'apis/admin';
import { useLazyGetActionStatusQuery } from 'apis/dataset';
import { POLLING_STATUS } from 'constants/common.constants';
import { ZAMP_LOGO_LOADER } from 'constants/lottie/zamp-logo-loader';
import { ROUTES_PATH } from 'constants/routeConfig';
import usePolling from 'hooks/usePolling';
import { EdgeOptions, S3_INGESTION_EDGE_LABEL } from 'modules/admin/admin.constants';
import { EditDatasetType, NodeType } from 'modules/admin/admin.types';
import { createNodeAndEdgeList, getLayoutedElements } from 'modules/admin/admin.utils';
import AdminDatasetTransform from 'modules/admin/AdminDatasetTransform';
import AdminEditTemplate from 'modules/admin/AdminEditTemplate';
import CreateDataset from 'modules/admin/CreateDataset';
import Notification from 'modules/data/Notification';
import { useRouter } from 'next/navigation';
import { CreateDatasetResponseType, TransformDatasetResponseType } from 'types/api/admin.types';
import { DatasetActionStatusResponseType } from 'types/api/dataset.types';
import { SIZE_TYPES } from 'types/common/components';
import { Button } from 'components/common/button/Button';
import { toast } from 'components/common/toast/Toast';
import { TOAST_MESSAGES } from 'components/common/toast/toast.constants';
import CommonWrapper from 'components/commonWrapper';
import { SkeletonTypes } from 'components/commonWrapper/commonWrapper.types';
import DynamicLottiePlayer from 'components/DynamicLottiePlayer';
import '@xyflow/react/dist/style.css';

const AdminDatasetDag: FC = () => {
  const { data, isFetching, isError, refetch } = useGetDatasetDagQuery();
  const { data: datasetListing, refetch: refetchDatasetListing } = useGetAllDatasetsQuery();
  const [getActionStatus] = useLazyGetActionStatusQuery();

  const { fitView } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [isCreateDatasetOpen, setIsCreateDatasetOpen] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [pollingMessage, setPollingMessage] = useState('');
  const [isCreateTransformationOpen, setIsCreateTransformationOpen] = useState(false);
  const [editTemplate, setEditTemplate] = useState<Edge | null>(null);
  const [editDataset, setEditDataset] = useState<EditDatasetType>();

  const defaultEdgeOptions = useMemo(() => EdgeOptions, []);

  const router = useRouter();
  const { startPolling } = usePolling();

  const onLayout = useCallback(() => {
    const layouted = getLayoutedElements(nodes, edges);

    setNodes([...layouted.nodes]);
    setEdges([...layouted.edges]);

    fitView();
  }, [nodes, edges]);

  const handleCreateTransformation = () => {
    setIsCreateTransformationOpen(true);
  };

  const handleCreateDataset = () => {
    setIsCreateDatasetOpen(true);
  };

  const handleListAllDatasets = () => {
    router.push(ROUTES_PATH.ADMIN_DATASETS);
  };

  const handleSuccessfulCreateDataset = (data: CreateDatasetResponseType) => {
    setIsPolling(true);
    setPollingMessage('Dataset creation in progress');
    startPolling({
      fn: () => {
        if (data?.dataset_id && data?.action_id) {
          return getActionStatus({ datasetId: data.dataset_id as string, params: { action_ids: [data.action_id] } });
        }

        return Promise.reject(new Error(`Dataset ID or Action ID is missing ${JSON.stringify(data)}`));
      },
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
      fn: () => {
        if (data?.dataset_id && data?.action_id) {
          return getActionStatus({ datasetId: data.dataset_id as string, params: { action_ids: [data.action_id] } });
        }

        return Promise.reject(new Error(`Dataset ID or Action ID is missing ${JSON.stringify(data)}`));
      },
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
          refetchDatasetListing();
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

  const handleEdgeClick = (_: any, edge: Edge) => {
    if (edge.label !== S3_INGESTION_EDGE_LABEL) {
      setEditTemplate(edge);
    }
  };

  const handleNodeClick = (_: any, node: Node) => {
    if (node.data.nodeType === NodeType.FOLDER) return;
    const dataset = datasetListing?.datasets?.find((item) => item.ID === node.id);

    setEditDataset({
      title: dataset?.Title ?? '',
      description: dataset?.Description ?? '',
      dedup_columns: dataset?.Metadata?.databricks_config?.dedup_columns ?? [],
      partition_columns: dataset?.Metadata?.databricks_config?.partition_columns ?? [],
      cluster_columns: dataset?.Metadata?.databricks_config?.cluster_columns ?? [],
      datasetId: dataset?.ID ?? '',
    });
    setIsCreateDatasetOpen(true);
  };

  const handleCloseCreateDataset = () => {
    setIsCreateDatasetOpen(false);
    setEditDataset(undefined);
  };

  useEffect(() => {
    if (!data || !datasetListing) return;

    const { nodes, edges } = createNodeAndEdgeList(data, datasetListing);

    setNodes(nodes);
    setEdges(edges);
  }, [data, datasetListing]);

  return (
    <>
      <CommonWrapper
        isLoading={isFetching}
        isError={isError}
        loader={
          <div className='flex justify-center items-center h-full'>
            <DynamicLottiePlayer
              src={ZAMP_LOGO_LOADER}
              className='lottie-player h-[140px]'
              autoplay
              loop
              keepLastFrame
            />
          </div>
        }
        skeletonType={SkeletonTypes.CUSTOM}
        refetchFunction={refetch}
        className='h-full w-full'
      >
        <div className='flex justify-between items-center p-4'>
          <Button id='layout-button' onClick={onLayout} size={SIZE_TYPES.SMALL}>
            Auto Arrange
          </Button>
          <div className='flex items-center gap-4'>
            <Notification isPolling={isPolling} message={pollingMessage} />
            <Button id='create-dataset' size={SIZE_TYPES.SMALL} onClick={handleListAllDatasets}>
              List All Datasets
            </Button>
            <Button id='create-transformation' size={SIZE_TYPES.SMALL} onClick={handleCreateTransformation}>
              Create Transformation
            </Button>
            <Button id='create-dataset' size={SIZE_TYPES.SMALL} onClick={handleCreateDataset}>
              Create Dataset
            </Button>
          </div>
        </div>
        <div className='h-full w-full'>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            fitView
            nodesConnectable={false}
            defaultEdgeOptions={defaultEdgeOptions}
            onEdgeClick={handleEdgeClick}
            onNodeClick={handleNodeClick}
          />
        </div>
      </CommonWrapper>
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
      {editTemplate && (
        <AdminEditTemplate isOpen={!!editTemplate} onClose={() => setEditTemplate(null)} edge={editTemplate} />
      )}
    </>
  );
};

export default AdminDatasetDag;
