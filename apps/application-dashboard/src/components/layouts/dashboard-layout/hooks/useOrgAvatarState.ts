import { useCallback } from 'react';
import { UploadType, UploadUrlRequest } from 'modules/onboarding/onboarding.types';
import { useGetOrgUploadUrlMutation } from '@/apis/setup-workspace';
import { useAvatarStateBase } from '@/hooks/useAvatarStateBase';

type Options = {
  initialValue: string;
  generateSvg: (value: string) => string;
  uploadType: UploadType;
  defaultName?: string;
};

/**
 * Same avatar/icon state as onboarding `useAvatarState`, but uses
 * `POST /organizations/assets/upload-url` (authenticated) instead of onboarding upload URL.
 */
export const useOrgAvatarState = ({ initialValue, generateSvg, uploadType, defaultName }: Options) => {
  const [getOrgUploadUrl] = useGetOrgUploadUrlMutation();
  const uploadFn = useCallback((req: UploadUrlRequest) => getOrgUploadUrl(req).unwrap(), [getOrgUploadUrl]);

  return useAvatarStateBase({
    initialValue,
    generateSvg,
    uploadType,
    defaultName,
    getUploadUrl: uploadFn,
  });
};
