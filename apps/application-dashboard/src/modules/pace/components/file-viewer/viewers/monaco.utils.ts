import { EXTENSION_TO_MONACO_LANGUAGE } from '@/modules/pace/components/files/files.constants';

export const getMonacoLanguage = (extension: string): string => {
  return EXTENSION_TO_MONACO_LANGUAGE[extension.toLowerCase()] || 'plaintext';
};
