import React, { FC, useEffect, useRef, useState } from 'react';
import { REQUEST_TYPES } from 'apis/apiEndpoint.constants';
import { useGetSignedUrlMutation } from 'apis/dataset';
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
import { FileUploaderWrapperPropsType } from '@/components/file-upload/fileUpload.types';

const FileUploaderWrapper: FC<FileUploaderWrapperPropsType> = ({
  acceptedFormats,
  fileName,
  disableNext,
  setFileName,
  maxSize = FILE_SIZE.TWO_MB,
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

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const filesToUpload: File | null = event?.target?.files?.[0] ?? null;

    setFileName?.(filesToUpload?.name ?? null);
    handleUpload(filesToUpload);
  };

  const uploadFileToSignedUrl = async (data: any, filesToUpload: File, fileExtension: string) => {
    const upload_url = data?.upload_url;
    const file_upload_id = data?.file_upload_id;

    if (upload_url) {
      const xhr = new XMLHttpRequest();

      xhr.open(REQUEST_TYPES.PUT, upload_url, true);
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

        if (xhr.status === 200) {
          onFileSelect?.({
            ...upload_url,
            fileName: filesToUpload?.name,
            downloadableUrl: upload_url,
          });
          disableNext?.(false);

          setFileUploadId?.(file_upload_id);
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
            .then((data: any) => {
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
      supportedFile={acceptedFormats}
      className={className}
      fileName={fileName}
      setFileName={setFileName}
      handleChange={handleChange}
      indexKey={fileUploaderKey}
      uploadProgress={showProgress ? uploadProgress : null}
      tabIndex={tabIndex}
      footer={footer}
      showUploadButton={showUploadButton}
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
