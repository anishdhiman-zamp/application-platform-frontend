import { useCallback, useRef, useState } from 'react';
import type { AvatarDisplay } from 'modules/onboarding/components/AvatarPicker';
import { AvatarState, ImageContentType, MediaType, UploadType } from 'modules/onboarding/onboarding.types';
import { useGetUploadUrlMutation } from '@/apis/onboarding';

type Options = {
  initialValue: string;
  generateSvg: (value: string) => string;
  uploadType: UploadType;
  defaultName?: string;
};

export const useAvatarState = ({ initialValue, generateSvg, uploadType, defaultName = 'User' }: Options) => {
  const [avatar, setAvatar] = useState<AvatarState>({ type: MediaType.SEED, value: initialValue });
  const [variant, setVariant] = useState(0);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const userPickedRef = useRef(false);
  const [getUploadUrl] = useGetUploadUrlMutation();

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
      const contentType = pendingFile.type === 'image/jpeg' ? ImageContentType.JPEG : ImageContentType.PNG;
      const { upload_url, asset_value, media_type } = await getUploadUrl({
        upload_type: uploadType,
        content_type: contentType,
        seed_hint: avatar.value || defaultName,
      }).unwrap();

      if (upload_url) {
        await fetch(upload_url, {
          method: 'PUT',
          headers: { 'Content-Type': pendingFile.type },
          body: pendingFile,
        });
      }

      return { type: media_type, value: asset_value };
    }

    return { type: avatar.type, value: avatar.value || null };
  }, [avatar, pendingFile, getUploadUrl, uploadType]);

  return {
    display,
    updateSeed,
    handleShuffle,
    handleUpload,
    handleReset,
    uploadImage,
  };
};
