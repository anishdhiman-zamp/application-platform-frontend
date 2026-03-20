import { useCallback, useRef, useState } from 'react';
import type { AvatarDisplay } from 'modules/onboarding/components/AvatarPicker';
import { AvatarState, ImageContentType, MediaType, UploadType } from 'modules/onboarding/onboarding.types';
import { useGetOrgUploadUrlMutation } from '@/apis/setup-workspace';

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
export const useOrgAvatarState = ({ initialValue, generateSvg, uploadType, defaultName = 'User' }: Options) => {
  const [avatar, setAvatar] = useState<AvatarState>({ type: MediaType.SEED, value: initialValue });
  const [variant, setVariant] = useState(0);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const userPickedRef = useRef(false);
  const [getOrgUploadUrl] = useGetOrgUploadUrlMutation();

  const display: AvatarDisplay =
    avatar.type === MediaType.URL && avatar.previewUrl
      ? { type: 'url', src: avatar.previewUrl }
      : { type: 'seed', svg: generateSvg(avatar.value || defaultName) };

  const updateSeed = useCallback((value: string) => {
    if (!userPickedRef.current) {
      setAvatar({ type: MediaType.SEED, value: value || '' });
    }
  }, []);

  const handleShuffle = useCallback(
    (currentName: string) => {
      const next = variant + 1;

      setVariant(next);
      userPickedRef.current = true;
      setAvatar({ type: MediaType.SEED, value: (currentName || defaultName) + '_v' + next });
    },
    [variant, defaultName],
  );

  const handleUpload = useCallback((file: File, previewUrl: string) => {
    userPickedRef.current = true;
    setPendingFile(file);
    setAvatar({ type: MediaType.URL, value: '', previewUrl });
  }, []);

  const handleReset = useCallback(() => {
    userPickedRef.current = false;
    setPendingFile(null);
    setVariant(0);
    setAvatar({ type: MediaType.SEED, value: initialValue });
  }, [initialValue]);

  const uploadImage = useCallback(async (): Promise<{ type: MediaType; value: string | null }> => {
    if (avatar.type === MediaType.URL && pendingFile) {
      const contentType =
        pendingFile.type === 'image/jpeg'
          ? ImageContentType.JPEG
          : pendingFile.type === 'image/png'
            ? ImageContentType.PNG
            : null;

      if (!contentType) throw new Error('Unsupported image type. Please upload a JPEG or PNG.');

      const { upload_url, s3_uri } = await getOrgUploadUrl({
        upload_type: uploadType,
        content_type: contentType,
      }).unwrap();

      const uploadResponse = await fetch(upload_url, {
        method: 'PUT',
        headers: { 'Content-Type': pendingFile.type },
        body: pendingFile,
      });

      if (!uploadResponse.ok) throw new Error('Failed to upload image. Please try again.');

      return { type: avatar.type, value: s3_uri };
    }

    return { type: avatar.type, value: avatar.value || null };
  }, [avatar, pendingFile, getOrgUploadUrl, uploadType]);

  return {
    display,
    updateSeed,
    handleShuffle,
    handleUpload,
    handleReset,
    uploadImage,
  };
};
