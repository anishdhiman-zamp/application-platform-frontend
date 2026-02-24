'use client';

import { useCallback, useEffect, useRef } from 'react';
import { UPLOAD_TOAST_CONTENT_MAP } from 'modules/pace/components/progress-toast/progress-toast.constants';
import type { UploadProgressToastProps } from 'modules/pace/components/progress-toast/progress-toast.types';
import { getUploadType, showToast } from 'modules/pace/components/progress-toast/progress-toast.utils';
import { toast } from 'sonner';

const UploadProgressToast = ({ uploadState, onCancel }: UploadProgressToastProps) => {
  const toastIdRef = useRef<string | number | null>(null);

  const dismissToast = useCallback(() => {
    if (!toastIdRef.current) return;

    toast.dismiss(toastIdRef.current);
    toastIdRef.current = null;
  }, []);

  useEffect(() => {
    const uploadType = getUploadType(uploadState);
    const shouldShowToast = uploadState.isUploading && uploadType !== null;

    if (!shouldShowToast) {
      dismissToast();

      return;
    }

    const ToastContent = UPLOAD_TOAST_CONTENT_MAP[uploadType];

    showToast(toastIdRef, <ToastContent uploadState={uploadState} onCancel={onCancel} />);
  }, [uploadState, onCancel, dismissToast]);

  return null;
};

export default UploadProgressToast;
