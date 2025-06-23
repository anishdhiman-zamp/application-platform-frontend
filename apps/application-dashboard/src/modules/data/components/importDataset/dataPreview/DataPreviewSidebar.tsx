import React, { FC } from 'react';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { usePostAiTransformationConfirmMutation } from 'apis/dataset';
import { COLORS } from 'constants/colors';
import {
  AI_TRANSFORMATION_STATUS,
  FILE_IMPORT_STATUS_MSG,
} from 'modules/data/components/importDataset/importData.constants';
import { DataPreviewSidebarPropsType } from 'modules/data/components/importDataset/importData.types';
import { useParams, useSearchParams } from 'next/navigation';
import { SIZE_TYPES } from 'types/common/components';
import { BUTTON_TYPES } from 'types/components/button.type';
import { Button } from 'components/common/button/Button';
import { toast } from 'components/common/toast/Toast';

const DataPreviewSidebar: FC<DataPreviewSidebarPropsType> = ({
  fileName,
  onReset,
  fileUploadId,
  onRefetch,
  setShowAiTransformationStatus,
}) => {
  const searchParams = useSearchParams();
  const params = useParams();
  const datasetId = (params?.datasetId as string) || (searchParams?.get('datasetId') as string);
  const [postAiTransformationConfirm, { isLoading: isLoadingPostAiTransformationConfirm }] =
    usePostAiTransformationConfirmMutation();

  const handleConfirmImport = () => {
    postAiTransformationConfirm({ file_upload_id: fileUploadId, dataset_id: datasetId })
      .unwrap()
      .then(() => {
        toast.success(FILE_IMPORT_STATUS_MSG.FILE_IMPORT_AFTER_AI_SUCCESS);
        setShowAiTransformationStatus({
          open: true,
          status: AI_TRANSFORMATION_STATUS.STATUS_INGESTION_ONGOING.status,
          title: AI_TRANSFORMATION_STATUS.STATUS_INGESTION_ONGOING.title,
          description: AI_TRANSFORMATION_STATUS.STATUS_INGESTION_ONGOING.description,
        });
        onRefetch();
        onReset();
      })
      .catch(() => {
        toast.error(FILE_IMPORT_STATUS_MSG.FILE_IMPORT_DATA_FAILED);
      });
  };

  return (
    <div className='flex h-full flex-col justify-between'>
      <div className='flex flex-col px-6 pt-6'>
        <span className='f-16-600'>Import Data</span>
        <div className='flex w-full flex-col gap-2'>
          <div className='mt-6 flex items-center justify-start gap-1.5'>
            <SvgSpriteLoader id='file-06' width={14} height={14} color={COLORS.GRAY_1000} />
            <div className='flex w-full justify-between'>
              <span className='f-12-400'>{fileName}</span>
              <SvgSpriteLoader id='check' width={14} height={14} color={COLORS.GREEN_PRIMARY} />
            </div>
          </div>
          <div className='bg-GREEN_700 h-1 w-full rounded-lg'></div>
        </div>
      </div>
      <div className='border-GRAY_400 flex items-center justify-between border-t p-6 pb-12'>
        <span onClick={onReset} className='f-13-500 text-GRAY_1000 cursor-pointer'>
          Discard
        </span>
        <Button
          id='import-confirm-import'
          className='tw-min-w-[70px]'
          size={SIZE_TYPES.SMALL}
          type={BUTTON_TYPES.PRIMARY}
          isLoading={isLoadingPostAiTransformationConfirm}
          onClick={handleConfirmImport}
        >
          Import
        </Button>
      </div>
    </div>
  );
};

export default DataPreviewSidebar;
