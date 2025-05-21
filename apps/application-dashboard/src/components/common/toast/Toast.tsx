import { toast as sonnerToast } from '@zamp-platform/ui';
import { MapAny } from '@/types/commonTypes';

export const toast = {
  success: (message: string, options?: MapAny) => {
    sonnerToast.success(message, options);
  },
  error: (message: string, options?: MapAny) => {
    sonnerToast.error(message, options);
  },
  warn: (message: string, options?: MapAny) => {
    sonnerToast.warning(message, options);
  },
  loading: (message: string, options?: MapAny) => {
    return sonnerToast.warning(message, options);
  },
  dismiss: (toastId: string | number) => {
    sonnerToast.dismiss(toastId);
  },
};
