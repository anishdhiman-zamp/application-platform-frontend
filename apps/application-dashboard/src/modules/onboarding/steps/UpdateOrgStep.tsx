'use client';

import { useState } from 'react';
import { AvatarPicker } from 'modules/onboarding/components/AvatarPicker';
import { OnboardingInputStep } from 'modules/onboarding/components/OnboardingInputStep';
import { useAvatarState } from 'modules/onboarding/hooks/useAvatarState';
import { ERROR_MESSAGES, VALIDATION } from 'modules/onboarding/onboarding.constants';
import { OnboardingStepCallbacks, UploadType } from 'modules/onboarding/onboarding.types';
import { handleOnboardingApiError } from 'modules/onboarding/utils/onboardingErrors';
import { useSetupOrgMutation } from '@/apis/onboarding';
import { generateOrgIconSvg } from '@/utils/pixelArtGenerator';

type Props = OnboardingStepCallbacks & {
  username: string;
};

export const UpdateOrgStep = ({ username, onComplete, onWrongStep, onFlagDisabled }: Props) => {
  const [orgName, setOrgName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [setupOrg] = useSetupOrgMutation();

  const { display, updateSeed, handleShuffle, handleUpload, handleReset, uploadImage } = useAvatarState({
    initialValue: username + '_org',
    generateSvg: generateOrgIconSvg,
    uploadType: UploadType.ORG_ICON,
    defaultName: username + '_org',
  });

  const handleOrgNameChange = (val: string) => {
    setOrgName(val);
    setError(null);
    updateSeed(val);
  };

  const handleSubmit = async () => {
    if (!orgName.trim() || isSubmitting) return;
    if (orgName.trim().length > VALIDATION.ORG_NAME_MAX) {
      setError(ERROR_MESSAGES.ORG_NAME_MAX_LENGTH);

      return;
    }
    setError(null);
    setIsSubmitting(true);

    try {
      const { type, value } = await uploadImage();
      const result = await setupOrg({
        organization_name: orgName.trim(),
        icon_type: type,
        icon_value: value,
      }).unwrap();

      onComplete(result.onboarding_status, result.organization_id);
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
      label='Name your organisation'
      placeholder='e.g. Acme Inc'
      value={orgName}
      onChange={handleOrgNameChange}
      onSubmit={handleSubmit}
      disabled={!orgName.trim() || isSubmitting}
      error={error}
    >
      <AvatarPicker
        avatar={display}
        onShuffle={() => handleShuffle(orgName)}
        onUpload={handleUpload}
        onReset={handleReset}
      />
    </OnboardingInputStep>
  );
};
