import React, { ChangeEvent, FC, useEffect, useRef, useState } from 'react';
import { captureException } from '@sentry/browser';
import { REQUEST_TYPES } from '@zamp-platform/api';
import { API_ENDPOINTS } from 'apis/apiEndpoint.constants';
import {
  FILE_IMPORT_STATUS_MSG,
  FILE_SIZE,
  FileExtensionToInputFormatMapping,
  FileExtensionToTypeMap,
  FileMimeType,
} from 'modules/data/components/importDataset/importData.constants';
import { getFileType } from 'modules/data/components/importDataset/importData.utils';
import { RootState } from 'store';
import { useGetSignedUrlMutation } from '@/apis/fileUpload';
import { FileUploaderWrapperPropsType } from '@/components/file-upload/fileUpload.types';
import { useAppSelector } from '@/hooks/toolkit';
import { SignedUrlResponseType } from '@/types/api/fileUpload.types';
import { API_STATUS_CODES } from '@/types/common/statusCodes';

const FileUploaderWrapper: FC<FileUploaderWrapperPropsType> = ({
  acceptedFormats,
  disableNext,
  setFileName,
  maxSize = FILE_SIZE.TWENTY_MB,
  filesSelected,
  Component,
  className,
  onFileSelect,
  setRawData,
  setFileUploadId,
  isFileUploading = false,
  keepLoadingFlow,
  onUploadProgress,
  showProgress = false,
  tabIndex = 0,
  footer,
  showUploadButton,
  uploadPath = API_ENDPOINTS.DATASET_SIGNED_UPLOAD_URL_POST,
}) => {
  const organizationId = useAppSelector((state: RootState) => state?.user?.user?.orgs?.[0]?.organization_id) ?? '';

  const hiddenFileInput = useRef<HTMLInputElement>(null);
  const [getSignedUrl] = useGetSignedUrlMutation();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fileUploaderKey, setFileUploaderKey] = useState<number>(0);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [currentUploadFileName, setCurrentUploadFileName] = useState<string | null>(null);

  const handleChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const filesToUpload: File | null = event?.target?.files?.[0] ?? null;

    setCurrentUploadFileName(filesToUpload?.name ?? null);
    setFileName?.(filesToUpload?.name ?? null);
    handleUpload(filesToUpload);
  };

  const uploadFileToSignedUrl = async (data: SignedUrlResponseType, filesToUpload: File, fileExtension: string) => {
    const uploadUrl = data?.upload_url;
    const fileUploadId = data?.file_upload_id;

    if (uploadUrl) {
      const xhr = new XMLHttpRequest();

      xhr.open(REQUEST_TYPES.PUT, uploadUrl, true);
      xhr.setRequestHeader('Content-Type', getFileType(filesToUpload) || FileExtensionToTypeMap[fileExtension]);

      xhr.upload.onprogress = function (event) {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;

          setUploadProgress(Math.floor(percentComplete));
          onUploadProgress?.(Math.floor(percentComplete));
        }
      };

      xhr.onload = function () {
        if (typeof keepLoadingFlow === 'undefined') {
          setIsLoading(false);
        }

        if (xhr.status === API_STATUS_CODES.OK) {
          onFileSelect?.({
            identifier: fileUploadId,
            url: uploadUrl,
            fileName: filesToUpload?.name,
            downloadableUrl: uploadUrl,
            rawFile: filesToUpload ?? null,
          });
          disableNext?.(false);

          setFileUploadId?.(fileUploadId);
        } else {
          setIsLoading(false);
          setError(FILE_IMPORT_STATUS_MSG.FILE_UPLOAD_COMMON_ERROR);
        }
      };

      xhr.onerror = function () {
        setIsLoading(false);
        setError(FILE_IMPORT_STATUS_MSG.FILE_UPLOAD_COMMON_ERROR);
      };

      xhr.send(filesToUpload);
    }
  };

  const handleUpload = (filesToUpload: File | null) => {
    if (isLoading) return;
    if (hiddenFileInput?.current) hiddenFileInput.current.value = '';

    if (filesToUpload) {
      if (filesToUpload?.size > maxSize) {
        const err = `${FILE_IMPORT_STATUS_MSG.FILE_SIZE_EXCEEDED} ${maxSize / FILE_SIZE.ONE_MB}MB`;

        setError(err);
      } else {
        const fileExtension: string = filesToUpload?.name?.split('.')?.pop()?.toLowerCase() ?? '';
        const fileType = FileMimeType[getFileType(filesToUpload)] ?? fileExtension;
        const acceptedFormatsArr = acceptedFormats.split(',').map((item) => item.trim());
        const isAllowedFormat = acceptedFormatsArr.includes(FileExtensionToInputFormatMapping[fileExtension]);

        const signedUrlPayload = {
          path: uploadPath,
          payload: {
            file_name: filesToUpload?.name,
            file_type: fileType,
            organization_id: organizationId,
          },
        };

        if (isAllowedFormat) {
          setError(null);
          setIsLoading(true);
          onFileSelect?.(null);
          disableNext?.(true);
          getSignedUrl(signedUrlPayload)
            .unwrap()
            .then(async (data: SignedUrlResponseType) => {
              try {
                await uploadFileToSignedUrl(data, filesToUpload, fileExtension);
              } catch (error) {
                captureException(error);
                setIsLoading(false);
                setRawData?.(null);
                setError(FILE_IMPORT_STATUS_MSG.FILE_UPLOAD_COMMON_ERROR);
              }
            })
            .catch(() => {
              setIsLoading(false);
              setRawData?.(null);
              setError(FILE_IMPORT_STATUS_MSG.FILE_UPLOAD_COMMON_ERROR);
            });
        } else {
          const err = `${FILE_IMPORT_STATUS_MSG.FILE_TYPE_INVALID} ${acceptedFormats}`;

          setRawData?.(null);
          setError(err);
        }
      }
    }
  };

  const handleClick = () => {
    hiddenFileInput?.current?.click();
  };

  useEffect(() => {
    if (keepLoadingFlow) {
      setIsLoading(false);

      return;
    }

    if (filesSelected && isLoading) {
      setIsLoading(false);
    }
  }, [keepLoadingFlow, filesSelected, isLoading]);

  useEffect(() => {
    if (error) {
      setFileUploaderKey((prev) => prev + 1);
    }
  }, [error]);

  return (
    <Component
      onClick={handleClick}
      isLoading={isLoading || isFileUploading}
      isUploading={isLoading || isFileUploading}
      error={error}
      onFileDrop={handleUpload}
      filesSelected={filesSelected}
      supportedFiles={acceptedFormats}
      className={className}
      fileName={currentUploadFileName}
      setFileName={setFileName}
      indexKey={fileUploaderKey}
      uploadProgress={showProgress ? uploadProgress : null}
      tabIndex={tabIndex}
      footer={footer}
      showUploadButton={showUploadButton}
      isSuccess={keepLoadingFlow ?? false}
    >
      {!filesSelected && (
        <input
          type='file'
          ref={hiddenFileInput}
          onChange={handleChange}
          style={{ display: 'none' }}
          accept={acceptedFormats}
        />
      )}
    </Component>
  );
};

export default FileUploaderWrapper;
