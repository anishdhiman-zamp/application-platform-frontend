'use client';

import { useEffect, useRef, useState } from 'react';
import { AvatarPicker } from 'modules/onboarding/components/AvatarPicker';
import { AvatarState, MediaType, OnboardingStatus, UploadType } from 'modules/onboarding/onboarding.types';
import { generateOrgIconSvg } from 'modules/onboarding/utils/avatarGenerator';
import { useSetupOrgMutation } from '@/apis/onboarding';

type Props = {
  onComplete: (status: OnboardingStatus) => void;
};

export const UpdateOrgStep = ({ onComplete }: Props) => {
  const [orgName, setOrgName] = useState('');
  const [variant, setVariant] = useState(0);
  const [icon, setIcon] = useState<AvatarState>({ type: MediaType.SEED, value: '' });
  const [error, setError] = useState<string | null>(null);
  const userPickedIconRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [setupOrg, { isLoading }] = useSetupOrgMutation();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const getSvg = () => {
    if (icon.type === MediaType.URL && icon.previewUrl) {
      return `<img src="${icon.previewUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:8px;" />`;
    }

    return generateOrgIconSvg(icon.value || orgName);
  };

  const handleOrgNameChange = (val: string) => {
    setOrgName(val);
    setError(null);
    if (!userPickedIconRef.current) {
      setIcon({ type: MediaType.SEED, value: val });
    }
  };

  const handleShuffle = () => {
    const next = variant + 1;

    setVariant(next);
    userPickedIconRef.current = true;
    setIcon({ type: MediaType.SEED, value: (orgName || 'Org') + '_v' + next });
  };

  const handleUpload = (s3Uri: string, previewUrl: string) => {
    userPickedIconRef.current = true;
    setIcon({ type: MediaType.URL, value: s3Uri, previewUrl });
  };

  const handleRemove = () => {
    userPickedIconRef.current = false;
    setVariant(0);
    setIcon({ type: MediaType.SEED, value: orgName });
  };

  const handleSubmit = async () => {
    if (!orgName.trim()) return;
    setError(null);
    try {
      const result = await setupOrg({
        organization_name: orgName.trim(),
        icon_type: icon.type,
        icon_value: icon.value || null,
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
          uploadType={UploadType.ORG_ICON}
        />
      </div>

      <div className='mb-6'>
        <label className='mb-0.5 block text-xs font-normal' style={{ color: '#999' }}>
          Name your organisation
        </label>
        <div className='flex items-end gap-3'>
          <input
            ref={inputRef}
            type='text'
            value={orgName}
            onChange={(e) => handleOrgNameChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder='e.g. Acme Inc'
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
            disabled={!orgName.trim() || isLoading}
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
