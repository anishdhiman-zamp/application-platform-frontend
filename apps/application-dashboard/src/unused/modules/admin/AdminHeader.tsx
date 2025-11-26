import { FC, useState } from 'react';
import { SIZE_TYPES } from 'types/common/components';
import { BUTTON_TYPES } from 'types/components/button.type';
import { useGetAllDatasetsQuery, usePostDatasetDisplayConfigMutation } from '@/apis/admin';
import CommonWrapper from '@/components/commonWrapper';
import { AdminHeaderPropsType } from '@/unused/modules/admin/admin.types';
import JsonPreviewSidebar from '@/unused/modules/admin/components/previewSidebar';
import { Button } from 'components/common/button/Button';
import { toast } from 'components/common/toast/Toast';

const AdminHeader: FC<AdminHeaderPropsType> = ({ displayConfigInitialData, displayConfigFinalData, datasetId }) => {
  const [isJsonPreviewSidebarOpen, setIsJsonPreviewSidebarOpen] = useState(false);
  const [postDatasetDisplayConfig, { isLoading }] = usePostDatasetDisplayConfigMutation();
  const { data: datasetListing, isLoading: isDatasetListingLoading } = useGetAllDatasetsQuery();

  const disableUpdateButton = JSON.stringify(displayConfigInitialData) === JSON.stringify(displayConfigFinalData);

  const handleOpenJsonPreviewSidebar = () => setIsJsonPreviewSidebarOpen(true);
  const handleCloseJsonPreviewSidebar = () => setIsJsonPreviewSidebarOpen(false);

  const handleUpdateJson = () => {
    postDatasetDisplayConfig({ datasetId: datasetId, body: { display_config: displayConfigFinalData } })
      .unwrap()
      .then(() => {
        toast.success('Updated successfully.');
      })
      .catch(() => {
        toast.error('Failed to update.');
      });
  };

  return (
    <div className='flex items-center justify-between px-10'>
      <CommonWrapper isLoading={isDatasetListingLoading}>
        <div className='f-20-600'>
          Edit {datasetListing?.datasets?.find((dataset) => dataset.ID === datasetId)?.Title}
        </div>
      </CommonWrapper>
      <div className='flex justify-end gap-2 px-10 py-3'>
        {isJsonPreviewSidebarOpen && (
          <JsonPreviewSidebar
            originalJson={displayConfigInitialData}
            formattedJson={displayConfigFinalData}
            isOpen={isJsonPreviewSidebarOpen}
            onClose={handleCloseJsonPreviewSidebar}
          />
        )}
        <Button
          type={BUTTON_TYPES.PRIMARY}
          id='preview-json'
          size={SIZE_TYPES.SMALL}
          onClick={handleOpenJsonPreviewSidebar}
        >
          Preview Json
        </Button>
        <Button
          type={BUTTON_TYPES.PRIMARY}
          id='update-preview-json'
          size={SIZE_TYPES.SMALL}
          onClick={handleUpdateJson}
          isLoading={isLoading}
          disabled={disableUpdateButton}
        >
          Update
        </Button>
      </div>
    </div>
  );
};

export default AdminHeader;
