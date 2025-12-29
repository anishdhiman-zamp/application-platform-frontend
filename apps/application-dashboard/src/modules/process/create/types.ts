import { ArrayListOption } from '@/components/multiSelectInput/multiSelectInput.types';

export type ProcessCreationFormData = {
  processName: string;
  selectedAudiences: ArrayListOption[];
};

export type ProcessCreationErrors = {
  processName?: string;
  audiences?: string;
};
