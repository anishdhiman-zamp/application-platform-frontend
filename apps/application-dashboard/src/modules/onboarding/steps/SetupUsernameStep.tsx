'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AvatarImage } from 'modules/onboarding/components/AvatarPicker';
import { OnboardingInputStep } from 'modules/onboarding/components/OnboardingInputStep';
import { ERROR_MESSAGES, FEEDBACK_MESSAGES, VALIDATION } from 'modules/onboarding/onboarding.constants';
import { OnboardingStepCallbacks } from 'modules/onboarding/onboarding.types';
import { handleOnboardingApiError } from 'modules/onboarding/utils/onboardingErrors';
import { useLazyCheckUsernameQuery, useUpdateProfileMutation } from '@/apis/onboarding';
import { generateAtIconSvg } from '@/utils/pixelArtGenerator';

export interface SetupUsernameStepInterface extends OnboardingStepCallbacks {
  initialUsername?: string;
}

export const SetupUsernameStep = ({
  initialUsername = '',
  onComplete,
  onWrongStep,
  onFlagDisabled,
}: SetupUsernameStepInterface) => {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [checkUsername] = useLazyCheckUsernameQuery();
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();

  const [username, setUsername] = useState(initialUsername);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);

  const check = useCallback(
    async (val: string) => {
      if (!val || val.length < VALIDATION.USERNAME_MIN || !VALIDATION.USERNAME_REGEX.test(val)) {
        setAvailable(null);

        return;
      }
      setChecking(true);
      try {
        const result = await checkUsername(val).unwrap();

        setAvailable(result.available);
        setError(result.available ? null : ERROR_MESSAGES.USERNAME_TAKEN);
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

  const getValidationError = (val: string): string | null => {
    if (val.length < VALIDATION.USERNAME_MIN || val.length > VALIDATION.USERNAME_MAX)
      return ERROR_MESSAGES.USERNAME_LENGTH;
    if (!VALIDATION.USERNAME_REGEX.test(val)) return ERROR_MESSAGES.USERNAME_FORMAT;
    if (available === false) return ERROR_MESSAGES.USERNAME_TAKEN;

    return null;
  };

  const handleSubmit = useCallback(async () => {
    const trimmed = username.trim();

    if (!trimmed) return;

    const validationError = getValidationError(trimmed);

    if (validationError) {
      setError(validationError);

      return;
    }

    try {
      const result = await updateProfile({ username: trimmed }).unwrap();

      onComplete(result.onboarding_status);
    } catch (err) {
      if (!handleOnboardingApiError(err, { setError, onWrongStep, onFlagDisabled })) {
        setError(ERROR_MESSAGES.GENERIC);
      }
    }
  }, [username, available, updateProfile, onComplete, onWrongStep, onFlagDisabled]);

  useEffect(() => {
    if (initialUsername) check(initialUsername);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
