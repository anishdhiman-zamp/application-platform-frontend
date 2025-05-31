import { FC } from 'react';
import { ICellRendererParams } from 'ag-grid-community';
import { getAdminDatasetRouteById } from 'constants/routeConfig';
import { DATASET_ACTIONS } from 'modules/admin/admin.constants';
import { AdminDatasetActionTypes, AdminDeleteDatasetDetailsType } from 'modules/admin/admin.types';
import { useRouter } from 'next/navigation';
import TooltipButton from 'components/common/button/TooltipButton';
import { TooltipPositions } from 'components/common/tooltip';

type AdminDatasetActionsProps = ICellRendererParams & {
  onDelete: (datasetDetails: AdminDeleteDatasetDetailsType) => void;
};

const AdminDatasetActions: FC<AdminDatasetActionsProps> = ({ data, onDelete }) => {
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
    }
  };

  return (
    <div className='flex items-center gap-1.5 justify-end'>
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
