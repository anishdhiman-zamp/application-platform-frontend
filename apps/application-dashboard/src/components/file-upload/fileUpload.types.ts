import { Dispatch, SetStateAction } from 'react';
import { RawMetadata, UploadFileResponseType } from '@/types/api/dataset.types';

export type FileUploaderWrapperPropsType = {
  acceptedFormats: string;
  disableNext?: (value: boolean) => void;
  footer?: string;
  filesSelected?: string;
  isFileUploading?: boolean;
  maxSize?: number;
  Component: React.ElementType;
  className?: string;
  setRawData?: Dispatch<SetStateAction<RawMetadata | null>>;
  fileName?: string | null;
  setFileName?: (fileName: string | null) => void;
  onFileSelect?: (arg: UploadFileResponseType | null) => void;
  onUploadProgress?: (percent: number) => void;
  showProgress?: boolean;
  setFileUploadId?: (fileUploadId: string) => void;
  keepLoadingFlow?: boolean;
  showUploadButton?: boolean;
  tabIndex?: number;
};
