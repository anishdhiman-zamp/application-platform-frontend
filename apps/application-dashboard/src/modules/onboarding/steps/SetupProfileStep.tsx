'use client';

import { useEffect, useRef, useState } from 'react';
import { AvatarPicker } from 'modules/onboarding/components/AvatarPicker';
import { AvatarState, MediaType, OnboardingStatus, UploadType } from 'modules/onboarding/onboarding.types';
import { generateAvatarSvg, generatePlaceholderSvg } from 'modules/onboarding/utils/avatarGenerator';
import { useUpdateProfileMutation } from '@/apis/onboarding';

type Props = {
  initialName?: string;
  onComplete: (status: OnboardingStatus) => void;
};

export const SetupProfileStep = ({ initialName = '', onComplete }: Props) => {
  const [name, setName] = useState(initialName);
  const [variant, setVariant] = useState(0);
  const [avatar, setAvatar] = useState<AvatarState>({ type: MediaType.SEED, value: initialName });
  const [error, setError] = useState<string | null>(null);
  const userPickedAvatarRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const getSvg = () => {
    if (avatar.type === MediaType.URL && avatar.previewUrl) {
      return `<img src="${avatar.previewUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:8px;" />`;
    }
    if (avatar.value) {
      return generateAvatarSvg(avatar.value);
    }

    return generatePlaceholderSvg();
  };

  const handleNameChange = (val: string) => {
    setName(val);
    setError(null);
    if (!userPickedAvatarRef.current) {
      setAvatar({ type: MediaType.SEED, value: val || '' });
    }
  };

  const handleShuffle = () => {
    const next = variant + 1;

    setVariant(next);
    userPickedAvatarRef.current = true;
    const baseName = name || 'User';

    setAvatar({ type: MediaType.SEED, value: baseName + '_v' + next });
  };

  const handleUpload = (s3Uri: string, previewUrl: string) => {
    userPickedAvatarRef.current = true;
    setAvatar({ type: MediaType.URL, value: s3Uri, previewUrl });
  };

  const handleRemove = () => {
    userPickedAvatarRef.current = false;
    setVariant(0);
    setAvatar({ type: MediaType.SEED, value: name || '' });
  };

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setError(null);
    try {
      const result = await updateProfile({
        full_name: name.trim(),
        avatar_type: avatar.type,
        avatar_value: avatar.value || null,
      }).unwrap();

      onComplete(result.onboarding_status);
    } catch {
      setError('Something went wrong. Please try again.');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className='w-full max-w-[520px]'>
      <div className='mb-5'>
        <AvatarPicker
          svgContent={getSvg()}
          onShuffle={handleShuffle}
          onUpload={handleUpload}
          onRemove={handleRemove}
          uploadType={UploadType.AVATAR}
        />
      </div>

      <div className='mb-6'>
        <label className='mb-0.5 block text-xs font-normal' style={{ color: '#999' }}>
          What should we call you?
        </label>
        <div className='flex items-end gap-3'>
          <input
            ref={inputRef}
            type='text'
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder='Your name'
            className='flex-1 bg-transparent p-0 outline-none'
            style={{
              fontSize: 48,
              lineHeight: 1.4,
              fontFamily: "'FunnelDisplay', serif",
              color: '#1a1a1a',
              border: 'none',
            }}
          />
          <button
            type='button'
            onClick={handleSubmit}
            disabled={!name.trim() || isLoading}
            className='mb-4 flex shrink-0 cursor-pointer items-center justify-center transition-all hover:opacity-70 active:scale-90 disabled:pointer-events-none disabled:opacity-40'
          >
            <EnterIcon />
          </button>
        </div>
        {error && <p className='mt-2 text-sm text-red-500'>{error}</p>}
      </div>
    </div>
  );
};

const EnterIcon = () => (
  <svg width='24' height='24' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'>
    <rect width='16' height='16' rx='4' fill='#888888' />
    <path
      d='M11.3346 4.66675V5.25008C11.3346 6.65021 11.3346 7.35028 11.0622 7.88506C10.8225 8.35546 10.44 8.73791 9.96961 8.9776C9.43483 9.25008 8.73477 9.25008 7.33464 9.25008H4.66797M4.66797 9.25008L6.7513 7.16675M4.66797 9.25008L6.7513 11.3334'
      stroke='#FAFAFA'
      strokeWidth='1'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
);
