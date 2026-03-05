'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { OnboardingStatus } from 'modules/onboarding/onboarding.types';
import { generateAtIconSvg } from 'modules/onboarding/utils/avatarGenerator';
import { handleOnboardingApiError } from 'modules/onboarding/utils/onboardingErrors';
import { useLazyCheckUsernameQuery, useUpdateProfileMutation } from '@/apis/onboarding';

type Props = {
  initialUsername?: string;
  onComplete: (status: OnboardingStatus) => void;
  onWrongStep: () => void;
  onFlagDisabled: () => void;
};

const USERNAME_REGEX = /^[a-zA-Z0-9_-]+$/;

export const SetupUsernameStep = ({ initialUsername = '', onComplete, onWrongStep, onFlagDisabled }: Props) => {
  const [username, setUsername] = useState(initialUsername);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [checkUsername] = useLazyCheckUsernameQuery();
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();

  useEffect(() => {
    inputRef.current?.focus();
    if (initialUsername) check(initialUsername);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const check = useCallback(
    async (val: string) => {
      if (!val || val.length < 3 || !USERNAME_REGEX.test(val)) {
        setAvailable(null);
        setChecking(false);

        return;
      }
      setChecking(true);
      try {
        const result = await checkUsername(val).unwrap();

        setAvailable(result.available);
        if (!result.available) setError('This username is already taken');
        else setError(null);
      } catch {
        setAvailable(null);
      } finally {
        setChecking(false);
      }
    },
    [checkUsername],
  );

  const handleChange = (val: string) => {
    setUsername(val);
    setError(null);
    setAvailable(null);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => check(val), 400);
  };

  const handleSubmit = async () => {
    if (!username.trim()) return;
    if (username.length < 3 || username.length > 50) {
      setError('Username must be 3\u201350 characters');

      return;
    }
    if (!USERNAME_REGEX.test(username)) {
      setError('Only letters, numbers, underscores, and hyphens');

      return;
    }
    if (available === false) {
      setError('This username is already taken');

      return;
    }
    setError(null);
    try {
      const result = await updateProfile({ username: username.trim() }).unwrap();

      onComplete(result.onboarding_status);
    } catch (err) {
      if (!handleOnboardingApiError(err, { setError, onWrongStep, onFlagDisabled })) {
        setError('Something went wrong. Please try again.');
      }
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
        <div
          className='[&_svg]:h-full [&_svg]:w-full'
          style={{ width: 63, height: 63, borderRadius: 8, overflow: 'hidden' }}
          dangerouslySetInnerHTML={{ __html: generateAtIconSvg() }}
        />
      </div>

      <div className='mb-6'>
        <label className='mb-0.5 block text-xs font-normal' style={{ color: '#999' }}>
          Pick a username
        </label>
        <div className='flex items-end gap-3'>
          <input
            ref={inputRef}
            type='text'
            value={username}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder='@username'
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
            disabled={!username.trim() || isLoading || checking || available === false}
            className='mb-4 flex shrink-0 cursor-pointer items-center justify-center transition-all hover:opacity-70 active:scale-90 disabled:pointer-events-none disabled:opacity-40'
          >
            <EnterIcon />
          </button>
        </div>

        {error && (
          <p
            className='mt-2 text-sm transition-opacity duration-200'
            style={{ color: '#e53935', fontFamily: 'Inter, sans-serif' }}
          >
            {error}
          </p>
        )}
        {!error && checking && <p className='mt-2 text-xs text-[#999]'>Checking availability\u2026</p>}
        {!error && !checking && available === true && username.length >= 3 && (
          <p className='mt-2 text-xs text-green-600'>Username is available</p>
        )}
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
