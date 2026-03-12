'use client';

import { useState } from 'react';
import { AvatarPicker } from 'modules/onboarding/components/AvatarPicker';
import { OnboardingInputStep } from 'modules/onboarding/components/OnboardingInputStep';
import { useAvatarState } from 'modules/onboarding/hooks/useAvatarState';
import { ERROR_MESSAGES, VALIDATION } from 'modules/onboarding/onboarding.constants';
import { OnboardingStepCallbacks, UploadType } from 'modules/onboarding/onboarding.types';
import { handleOnboardingApiError } from 'modules/onboarding/utils/onboardingErrors';
import { useUpdateProfileMutation } from '@/apis/onboarding';
import { generateAvatarSvg } from '@/utils/pixelArtGenerator';

type Props = OnboardingStepCallbacks & {
  initialName?: string;
  username: string;
};

export const SetupProfileStep = ({ initialName = '', username, onComplete, onWrongStep, onFlagDisabled }: Props) => {
  const [name, setName] = useState(initialName);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updateProfile] = useUpdateProfileMutation();

  const { display, updateSeed, handleShuffle, handleUpload, handleReset, uploadImage } = useAvatarState({
    initialValue: initialName || username,
    generateSvg: generateAvatarSvg,
    uploadType: UploadType.AVATAR,
    defaultName: username,
  });

  const handleNameChange = (val: string) => {
    setName(val);
    setError(null);
    updateSeed(val);
  };

  const handleSubmit = async () => {
    if (!name.trim() || isSubmitting) return;
    if (name.trim().length > VALIDATION.NAME_MAX) {
      setError(ERROR_MESSAGES.NAME_MAX_LENGTH);

      return;
    }
    setError(null);
    setIsSubmitting(true);

    try {
      const { type, value } = await uploadImage();
      const result = await updateProfile({
        full_name: name.trim(),
        avatar_type: type,
        avatar_value: value,
      }).unwrap();

      onComplete(result.onboarding_status);
    } catch (err) {
      if (!handleOnboardingApiError(err, { setError, onWrongStep, onFlagDisabled })) {
        setError(ERROR_MESSAGES.GENERIC);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <OnboardingInputStep
      label='What should we call you?'
      placeholder='Your full name'
      value={name}
      onChange={handleNameChange}
      onSubmit={handleSubmit}
      disabled={!name.trim() || isSubmitting}
      error={error}
    >
      <AvatarPicker
        avatar={display}
        onShuffle={() => handleShuffle(name)}
        onUpload={handleUpload}
        onReset={handleReset}
      />
    </OnboardingInputStep>
  );
};
