import FolderUploadToastContent from 'modules/pace/components/progress-toast/FolderUploadToastContent';
import type {
  UploadProgressToastProps,
  UploadToastType,
} from 'modules/pace/components/progress-toast/progress-toast.types';
import SingleFileUploadToastContent from 'modules/pace/components/progress-toast/SingleFileUploadToastContent';

export const UPLOAD_TOAST_CONTENT_MAP: Record<UploadToastType, React.FC<UploadProgressToastProps>> = {
  folder: FolderUploadToastContent,
  chunked: SingleFileUploadToastContent,
};
