import { FC, useEffect, useRef, useState } from 'react';
import { REQUEST_TYPES } from 'apis/apiEndpoint.constants';
import { useGetSignedUrlMutation } from 'apis/dataset';
import { useAppSelector } from 'hooks/toolkit';
import {
  FILE_SIZE,
  FileExtensionToInputFormatMapping,
  FileExtensionToTypeMap,
  FileMimeType,
} from 'modules/data/components/importDataset/importData.constants';
import { getFileType } from 'modules/data/components/importDataset/importData.utils';
import { RootState } from 'store';
import { UploadFileResponseType } from 'types/api/dataset.types';

interface FileUploaderWrapperProps {
  disableNext?: (arg: boolean) => void;
  acceptedFormats: string;
  onFilesSelect: (arg: UploadFileResponseType | null) => void;
  isFileUploading?: boolean;
  maxSize?: number;
  filesSelected?: string;
  setParentError?: (arg: string | null) => void;
  Component: React.ElementType;
  tabIndex?: number;
  onUploadProgress?: (percent: number) => void;
  bucket?: string;
  path?: string;
  showProgress?: boolean;
  title?: string;
  footer?: string;
  errorMsg?: string;
  isSuccess?: boolean;
  linkGeneration?: boolean;
  onClearSelection?: () => void;
  className?: string;
  errorClassName?: string;
  showUploadButton?: boolean;
}

const FileUploaderWrapperV2: FC<FileUploaderWrapperProps> = ({
  disableNext,
  acceptedFormats,
  onFilesSelect,
  isFileUploading = false,
  maxSize = FILE_SIZE.TWENTY_MB,
  filesSelected,
  setParentError,
  Component,
  tabIndex = 0,
  onUploadProgress,
  bucket,
  path,
  showProgress = false,
  ...rest
}) => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const hiddenFileInput = useRef<HTMLInputElement>(null);
  const { user } = useAppSelector((state: RootState) => state?.user);

  const [getSignedUrl] = useGetSignedUrlMutation({});

  useEffect(() => {
    if (filesSelected && isLoading) {
      setIsLoading(false);
    }
  }, [filesSelected]);

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const filesToUpload: File | null = event?.target?.files?.[0] ?? null;

    handleUpload(filesToUpload);
  };

  const handleUpload = (filesToUpload: File | null) => {
    if (isLoading) return;

    if (hiddenFileInput?.current) hiddenFileInput.current.value = '';
    if (filesToUpload)
      if (filesToUpload?.size > maxSize) {
        const err = `File size cannot exceed more than ${maxSize / FILE_SIZE.ONE_MB}MB`;

        setError(err);
        setParentError?.(err);
      } else {
        const fileExtension: string = filesToUpload?.name?.split('.')?.pop()?.toLowerCase() ?? '';

        //please add file type in FileMimeType on add new file format
        const fileName =
          user?.user_id + '_' + Date.now() + '.' + (FileMimeType[getFileType(filesToUpload)] ?? fileExtension);

        const acceptedFormatsArr = acceptedFormats.split(',').map((item) => item.trim());
        const payload = {
          file_name: fileName,
          file_type: FileMimeType[getFileType(filesToUpload)] ?? fileExtension,
        };

        const isAllowedFormat = acceptedFormatsArr.includes(FileExtensionToInputFormatMapping[fileExtension]);

        if (isAllowedFormat) {
          setError(null);
          setParentError?.(null);
          onFilesSelect(null);
          setIsLoading(true);
          disableNext?.(true);
          getSignedUrl(payload)
            .unwrap()
            .then(async (uploadUrl: any) => {
              if (uploadUrl) {
                const xhr = new XMLHttpRequest();

                xhr.open(REQUEST_TYPES.PUT, uploadUrl.url, true);
                xhr.setRequestHeader(
                  'Content-Type',
                  getFileType(filesToUpload) || FileExtensionToTypeMap[fileExtension],
                );

                xhr.upload.onprogress = function (event) {
                  if (event.lengthComputable) {
                    const percentComplete = (event.loaded / event.total) * 100;

                    setUploadProgress(Math.floor(percentComplete));
                    onUploadProgress?.(Math.floor(percentComplete));
                  }
                };

                xhr.onload = function () {
                  setIsLoading(false);
                  if (xhr.status === 200) {
                    onFilesSelect({ ...uploadUrl, fileName: filesToUpload?.name, rawFile: filesToUpload });
                    disableNext?.(false);
                  } else {
                    setError('Uploading failed!');
                    setParentError?.('Uploading failed!');
                  }
                };

                xhr.onerror = function () {
                  setError('Uploading failed!');
                  setParentError?.('Uploading failed!');
                };

                xhr.send(filesToUpload);
              }
            })
            .catch(() => {
              setError('Uploading failed!');
              setParentError?.('Uploading failed!');
            });
        } else {
          const err = `Invalid file type`;

          setError(err);
          setParentError?.(err);
        }
      }
  };

  const handleClick = () => {
    hiddenFileInput?.current?.click();
  };

  return (
    <Component
      {...rest}
      onFilesSelect={onFilesSelect}
      onClick={handleClick}
      isLoading={isLoading || isFileUploading}
      isUploading={isLoading || isFileUploading}
      error={error}
      onFileDrop={handleUpload}
      filesSelected={filesSelected}
      supportedFile={acceptedFormats}
      tabIndex={tabIndex}
      uploadProgress={showProgress ? uploadProgress : null}
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

export default FileUploaderWrapperV2;
