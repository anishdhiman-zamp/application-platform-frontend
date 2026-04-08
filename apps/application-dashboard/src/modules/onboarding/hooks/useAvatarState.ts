import { useCallback } from 'react';
import { UploadType, UploadUrlRequest } from 'modules/onboarding/onboarding.types';
import { useGetUploadUrlMutation } from '@/apis/onboarding';
import { useAvatarStateBase } from '@/hooks/useAvatarStateBase';

type Options = {
  initialValue: string;
  generateSvg: (value: string) => string;
  uploadType: UploadType;
  defaultName?: string;
};

export const useAvatarState = ({ initialValue, generateSvg, uploadType, defaultName }: Options) => {
  const [getUploadUrl] = useGetUploadUrlMutation();
  const uploadFn = useCallback((req: UploadUrlRequest) => getUploadUrl(req).unwrap(), [getUploadUrl]);

  return useAvatarStateBase({
    initialValue,
    generateSvg,
    uploadType,
    defaultName,
    getUploadUrl: uploadFn,
  });
};
