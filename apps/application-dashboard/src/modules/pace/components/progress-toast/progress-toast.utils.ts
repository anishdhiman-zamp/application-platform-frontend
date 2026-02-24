import type { UploadState, UploadToastType } from 'modules/pace/components/progress-toast/progress-toast.types';
import { toast } from 'sonner';
import { UPLOAD_TYPE } from '@/modules/pace/components/files/file-tree.types';

export const getUploadType = (uploadState: UploadState): UploadToastType | null => {
  if (uploadState.folderUpload !== null) return 'folder';
  if (uploadState.currentUpload?.uploadType === UPLOAD_TYPE.CHUNKED) return 'chunked';

  return null;
};

export const showToast = (toastIdRef: React.MutableRefObject<string | number | null>, content: React.ReactNode) => {
  const options = { duration: Infinity, closeButton: false };

  if (toastIdRef.current) {
    toast(content, { ...options, id: toastIdRef.current });
  } else {
    toastIdRef.current = toast(content, options);
  }
};
