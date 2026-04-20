import React, { FC, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { TooltipV2 } from '@zamp-platform/ui';
import {
  useGetPreviewTransformationMutation,
  useLazyGetActionStatusQuery,
  useLazyGetAiTransformationQuery,
} from 'apis/dataset';
import { COINS_STACKED_05 } from 'constants/icons';
import usePolling from 'hooks/usePolling';
import ImportedDataPreview from 'modules/data/components/importDataset/dataPreview';
import {
  AI_TRANSFORMATION_STATUS,
  FILE_IMPORT_STATUS_MSG,
} from 'modules/data/components/importDataset/importData.constants';
import {
  ImportDatasetPropsType,
  StartPollingPreviewType,
} from 'modules/data/components/importDataset/importData.types';
import ImportFileWrapper from 'modules/data/components/importDataset/ImportFileWrapper';
import Image from 'next/image';
import { useParams, useSearchParams } from 'next/navigation';
import { addDatasetBulkLoaders, removeDatasetBulkLoader } from 'store/slices/user';
import { DatasetActionStatusResponseType, RawMetadata, TransformationPreviewMetadata } from 'types/api/dataset.types';
import { cn } from 'utils/common';
import { toast } from '@/components/common/toast/Toast';
import { SIDE_OPTIONS } from '@/types/commonTypes';

const ImportDataset: FC<ImportDatasetPropsType> = ({ setShowAiTransformationStatus, onRefetch, disable }) => {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const params = useParams();
  const isDatasetRoute = !!params?.datasetId || !!searchParams?.get('datasetId');
  const datasetId = (params?.datasetId as string) || (searchParams?.get('datasetId') as string);
  const { startPolling } = usePolling();
  const [getActionStatus] = useLazyGetActionStatusQuery();
  const [getAiTransformation] = useLazyGetAiTransformationQuery();
  const [getPreviewTransformation, { isSuccess: isSuccessPreviewTransformation }] =
    useGetPreviewTransformationMutation();
  const [isLoading, setIsLoading] = useState(false);
  const [fileUploadId, setFileUploadId] = useState<string>('');
  const [rawData, setRawData] = useState<RawMetadata | null>(null);
  const [startAiTransformation, setStartAiTransformation] = useState<boolean>(false);
  const [isImportFilePopupOpen, setIsImportFilePopupOpen] = useState<boolean>(false);
  const [mappedData, setMappedData] = useState<TransformationPreviewMetadata | null>(null);
  const [startPollingPreview, setStartPollingPreview] = useState<StartPollingPreviewType>({
    check: false,
    actionId: '',
    fileUploadId: '',
  });
  const [fileName, setFileName] = useState<string | null>(null);

  const handleOpenImportFilePopup = () => setIsImportFilePopupOpen(true);
  const handleCloseImportFilePopup = () => setIsImportFilePopupOpen(false);

  const handleReset = () => {
    setRawData(null);
    setMappedData(null);
    setStartAiTransformation(false);
    handleCloseImportFilePopup();
  };

  const handleShowAiTransformationStatus = () => {
    setShowAiTransformationStatus({
      open: true,
      status: AI_TRANSFORMATION_STATUS.STATUS_LOADING.status,
      title: AI_TRANSFORMATION_STATUS.STATUS_LOADING.title,
      description: AI_TRANSFORMATION_STATUS.STATUS_LOADING.description,
    });

    dispatch(
      addDatasetBulkLoaders({
        id: startPollingPreview?.actionId,
        status: AI_TRANSFORMATION_STATUS.STATUS_LOADING.status,
        title: AI_TRANSFORMATION_STATUS.STATUS_LOADING.title,
        description: AI_TRANSFORMATION_STATUS.STATUS_LOADING.description,
      }),
    );

    startPolling({
      fn: () => getActionStatus({ datasetId, params: { action_ids: [startPollingPreview?.actionId] } }),
      validate: (data: DatasetActionStatusResponseType[]) => data?.filter((item) => !item.is_completed)?.length === 0,
      interval: 3000,
      maxAttempts: 50,
    })
      .then(() => {
        return getAiTransformation({ file_upload_id: startPollingPreview?.fileUploadId }).unwrap();
      })
      .then((data) => {
        dispatch(removeDatasetBulkLoader(startPollingPreview?.actionId));
        setShowAiTransformationStatus({
          open: true,
          status: AI_TRANSFORMATION_STATUS.STATUS_SUCCESS.status,
          title: AI_TRANSFORMATION_STATUS.STATUS_SUCCESS.title,
          description: AI_TRANSFORMATION_STATUS.STATUS_SUCCESS.description,
        });
        setIsImportFilePopupOpen(true);
        setStartAiTransformation(true);

        setMappedData({
          data_preview: data?.data_preview,
        });
      })
      .catch(() => {
        handleReset();
        dispatch(removeDatasetBulkLoader(startPollingPreview?.actionId));
        setShowAiTransformationStatus({
          open: true,
          status: AI_TRANSFORMATION_STATUS.STATUS_ERROR.status,
          title: AI_TRANSFORMATION_STATUS.STATUS_ERROR.title,
          description: AI_TRANSFORMATION_STATUS.STATUS_ERROR.description,
        });
      });
  };

  const triggerPreviewTransformation = async (fileUploadId: string) => {
    const oldDatasetImportPayload = {
      file_upload_id: fileUploadId,
      dataset_id: datasetId,
    };
    const newDatasetImportPayload = { file_upload_id: fileUploadId };
    const payload = isDatasetRoute ? oldDatasetImportPayload : newDatasetImportPayload;

    getPreviewTransformation(payload)
      .unwrap()
      .then((data) => {
        if (data?.dataset_action_id) {
          setStartPollingPreview({ check: true, actionId: data?.dataset_action_id, fileUploadId });

          setTimeout(() => {
            handleCloseImportFilePopup();
          }, 1500);
        }
      })
      .catch(() => {
        setRawData(null);
        toast.error(FILE_IMPORT_STATUS_MSG.PREVIEW_DATA_FAILED);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    if (fileUploadId?.length > 0) {
      triggerPreviewTransformation(fileUploadId);
    }
  }, [fileUploadId]);

  useEffect(() => {
    if (startPollingPreview?.check) {
      handleShowAiTransformationStatus();
    }
  }, [startPollingPreview]);

  return (
    <div className='z-40 h-5.5 w-5.5'>
      {isImportFilePopupOpen && !startAiTransformation ? (
        <ImportFileWrapper
          fileName={fileName}
          setFileName={setFileName}
          isOpen={isImportFilePopupOpen}
          setRawData={setRawData}
          onReset={handleReset}
          onClose={handleCloseImportFilePopup}
          setFileUploadId={setFileUploadId}
          keepLoadingFlow={isSuccessPreviewTransformation}
          isFileUploading={isLoading}
        />
      ) : isImportFilePopupOpen && startAiTransformation ? (
        <ImportedDataPreview
          fileName={fileName}
          onReset={handleReset}
          rawData={rawData}
          mappedData={mappedData}
          startAiTransformation={startAiTransformation}
          setShowAiTransformationStatus={setShowAiTransformationStatus}
          fileUploadId={startPollingPreview?.fileUploadId}
          onRefetch={onRefetch}
        />
      ) : null}
      <TooltipV2
        tooltipBody='Import Data'
        side={SIDE_OPTIONS.BOTTOM}
        tooltipClassName='f-12-300 rounded-md whitespace-nowrap z-[1000] bg-black text-GRAY_200'
        className='z-1 h-full w-full'
      >
        <div
          className={cn(
            'rounded! p-1',
            isImportFilePopupOpen && 'bg-GRAY_100',
            disable
              ? 'disabled:text-GRAY_300 hover:text-GRAY_300 cursor-not-allowed'
              : 'hover:text-GRAY_100 cursor-pointer',
          )}
        >
          <Image
            src={COINS_STACKED_05}
            alt='coins-stacked-05'
            width={14}
            height={14}
            className='text-GRAY_900'
            onClick={handleOpenImportFilePopup}
          />
        </div>
      </TooltipV2>
    </div>
  );
};

export default ImportDataset;
