import { toast as sonnerToast } from '@zamp-platform/ui';

export const toast = {
  success: (message: string) => {
    sonnerToast.success(message);
  },
  error: (message: string) => {
    sonnerToast.error(message);
  },
  warn: (message: string) => {
    sonnerToast.warning(message);
  },
  loading: (message: string) => {
    return sonnerToast.warning(message);
  },
  dismiss: (toastId: string | number) => {
    sonnerToast.dismiss(toastId);
  },
};
