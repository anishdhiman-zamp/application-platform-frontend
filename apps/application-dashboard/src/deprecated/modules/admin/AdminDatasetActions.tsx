import { DATASET_ACTIONS } from '@/deprecated/modules/admin/admin.constants';
import {
  AdminDatasetActionTypes,
  AdminDeleteDatasetDetailsType,
  EditDatasetType,
} from '@/deprecated/modules/admin/admin.types';
import { ICellRendererParams } from 'ag-grid-community';
import TooltipButton from 'components/common/button/TooltipButton';
import { TooltipPositions } from 'components/common/tooltip';
import { getAdminDatasetRouteById } from 'constants/routeConfig';
import { useRouter } from 'next/navigation';
import { FC } from 'react';

type AdminDatasetActionsProps = ICellRendererParams & {
  onDelete: (datasetDetails: AdminDeleteDatasetDetailsType) => void;
  onEditDataset: (dataset: EditDatasetType) => void;
};

const AdminDatasetActions: FC<AdminDatasetActionsProps> = ({ data, onDelete, onEditDataset }) => {
  const router = useRouter();

  const onActionClick = (action: AdminDatasetActionTypes) => {
    switch (action) {
      case AdminDatasetActionTypes.EDIT:
        router.push(getAdminDatasetRouteById(data?.ID));
        break;
      case AdminDatasetActionTypes.DELETE:
        onDelete?.({
          datasetId: data?.ID,
          datasetName: data?.Title,
        });
        break;
      case AdminDatasetActionTypes.EDIT_DATASET:
        onEditDataset?.({
          title: data?.Title,
          description: data?.Description,
          dedup_columns: data?.Metadata?.databricks_config?.dedup_columns,
          partition_columns: data?.Metadata?.databricks_config?.partition_columns,
          cluster_columns: data?.Metadata?.databricks_config?.cluster_columns,
          order_by_column: data?.Metadata?.databricks_config?.order_by_column,
          datasetId: data?.ID,
        });
        break;
    }
  };

  return (
    <div className='flex items-center justify-end gap-1.5'>
      {DATASET_ACTIONS.map((action) => (
        <TooltipButton
          key={action.value}
          id={action.value}
          tooltipBody={action.label}
          buttonIcon={{ id: action.iconId }}
          tooltipPosition={TooltipPositions.LEFT}
          onClick={() => onActionClick(action.value)}
        />
      ))}
    </div>
  );
};

export default AdminDatasetActions;
