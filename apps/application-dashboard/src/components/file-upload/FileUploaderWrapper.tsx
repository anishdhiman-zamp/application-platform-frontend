import React, { ChangeEvent, FC, useEffect, useRef, useState } from 'react';
import { REQUEST_TYPES } from 'apis/apiEndpoint.constants';
import { useAppSelector } from 'hooks/toolkit';
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
import { SignedUrlResponseType } from '@/types/api/fileUpload.types';
import { API_STATUS_CODES } from '@/types/common/statusCodes';

const FileUploaderWrapper: FC<FileUploaderWrapperPropsType> = ({
  acceptedFormats,
  fileName,
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
}) => {
  const hiddenFileInput = useRef<HTMLInputElement>(null);
  const user_id = useAppSelector((state: RootState) => state?.user)?.user?.user_id;
  const [getSignedUrl] = useGetSignedUrlMutation();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fileUploaderKey, setFileUploaderKey] = useState<number>(0);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const handleChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const filesToUpload: File | null = event?.target?.files?.[0] ?? null;

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
        const fileName = user_id + '_' + Date.now() + '.' + (FileMimeType[getFileType(filesToUpload)] ?? fileExtension);
        const fileType = FileMimeType[getFileType(filesToUpload)] ?? fileExtension;
        const acceptedFormatsArr = acceptedFormats.split(',').map((item) => item.trim());
        const isAllowedFormat = acceptedFormatsArr.includes(FileExtensionToInputFormatMapping[fileExtension]);

        const signedUrlPayload = {
          file_name: fileName,
          file_type: fileType,
        };

        if (isAllowedFormat) {
          setError(null);
          setIsLoading(true);
          onFileSelect?.(null);
          disableNext?.(true);
          getSignedUrl(signedUrlPayload)
            .unwrap()
            .then((data: SignedUrlResponseType) => {
              uploadFileToSignedUrl(data, filesToUpload, fileExtension);
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
      fileName={fileName}
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
