'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AvatarImage } from 'modules/onboarding/components/AvatarPicker';
import { OnboardingInputStep } from 'modules/onboarding/components/OnboardingInputStep';
import { ERROR_MESSAGES, FEEDBACK_MESSAGES, VALIDATION } from 'modules/onboarding/onboarding.constants';
import { OnboardingStepCallbacks } from 'modules/onboarding/onboarding.types';
import { generateAtIconSvg } from 'modules/onboarding/utils/avatarGenerator';
import { handleOnboardingApiError } from 'modules/onboarding/utils/onboardingErrors';
import { useLazyCheckUsernameQuery, useUpdateProfileMutation } from '@/apis/onboarding';

type Props = OnboardingStepCallbacks & {
  initialUsername?: string;
};

export const SetupUsernameStep = ({ initialUsername = '', onComplete, onWrongStep, onFlagDisabled }: Props) => {
  const [username, setUsername] = useState(initialUsername);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [checkUsername] = useLazyCheckUsernameQuery();
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();

  const check = useCallback(
    async (val: string) => {
      if (!val || val.length < VALIDATION.USERNAME_MIN || !VALIDATION.USERNAME_REGEX.test(val)) {
        setAvailable(null);
        setChecking(false);

        return;
      }
      setChecking(true);
      try {
        const result = await checkUsername(val).unwrap();

        setAvailable(result.available);
        if (!result.available) setError(ERROR_MESSAGES.USERNAME_TAKEN);
        else setError(null);
      } catch {
        setAvailable(null);
      } finally {
        setChecking(false);
      }
    },
    [checkUsername],
  );

  useEffect(() => {
    if (initialUsername) check(initialUsername);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (val: string) => {
    setUsername(val);
    setError(null);
    setAvailable(null);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => check(val), 400);
  };

  const handleSubmit = async () => {
    if (!username.trim()) return;
    if (username.length < VALIDATION.USERNAME_MIN || username.length > VALIDATION.USERNAME_MAX) {
      setError(ERROR_MESSAGES.USERNAME_LENGTH);

      return;
    }
    if (!VALIDATION.USERNAME_REGEX.test(username)) {
      setError(ERROR_MESSAGES.USERNAME_FORMAT);

      return;
    }
    if (available === false) {
      setError(ERROR_MESSAGES.USERNAME_TAKEN);

      return;
    }
    setError(null);
    try {
      const result = await updateProfile({ username: username.trim() }).unwrap();

      onComplete(result.onboarding_status);
    } catch (err) {
      if (!handleOnboardingApiError(err, { setError, onWrongStep, onFlagDisabled })) {
        setError(ERROR_MESSAGES.GENERIC);
      }
    }
  };

  return (
    <OnboardingInputStep
      label='Pick a username'
      placeholder='@username'
      value={username}
      onChange={handleChange}
      onSubmit={handleSubmit}
      disabled={!username.trim() || isLoading || checking || available === false}
      error={error}
      feedback={
        <>
          {!error && checking && <p className='text-GRAY_700 mt-2 text-xs'>{FEEDBACK_MESSAGES.CHECKING_USERNAME}</p>}
          {!error && !checking && available === true && username.length >= VALIDATION.USERNAME_MIN && (
            <p className='text-GREEN_700 mt-2 text-xs'>{FEEDBACK_MESSAGES.USERNAME_AVAILABLE}</p>
          )}
        </>
      }
    >
      <AvatarImage avatar={{ type: 'seed', svg: generateAtIconSvg() }} size={63} />
    </OnboardingInputStep>
  );
};
