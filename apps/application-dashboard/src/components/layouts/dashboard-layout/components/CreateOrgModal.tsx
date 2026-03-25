'use client';

import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { Button, Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader, Input } from '@zamp-platform/ui';
import type { AvatarDisplay } from 'modules/onboarding/components/AvatarPicker';
import { AvatarImage, AvatarPicker } from 'modules/onboarding/components/AvatarPicker';
import { ERROR_MESSAGES, VALIDATION } from 'modules/onboarding/onboarding.constants';
import { UploadType } from 'modules/onboarding/onboarding.types';
import {
  MEDIA_TYPE,
  PROVISIONING_POLL_INTERVAL_MS,
  PROVISIONING_STATUS,
} from 'modules/setup-workspace/setup-workspace.constants';
import { useLazyWhoAmIQuery } from '@/apis/auth';
import { useProvisionOrgMutation, useRegisterOrgMutation } from '@/apis/setup-workspace';
import { Loader } from '@/components/common/loader/Loader';
import ErrorCard from '@/components/commonWrapper/ErrorCard';
import { useOrgAvatarState } from '@/components/layouts/dashboard-layout/hooks/useOrgAvatarState';
import { SIZE } from '@/constants/common.constants';
import { KEYBOARD_KEYS } from '@/constants/shortcuts';
import { useAppDispatch, useAppSelector } from '@/hooks/toolkit';
import { setUser } from '@/store/slices/user';
import type { Organization } from '@/types/api/auth.types';
import { generateOrgIconSvg } from '@/utils/pixelArtGenerator';

enum ModalStep {
  INPUT = 'input',
  PROVISIONING = 'provisioning',
  TAKING_LONGER = 'taking-longer',
}

interface CreateOrgModalProps {
  open: boolean;
  onClose: () => void;
  orgToProvision?: Organization | null;
  onOrgReady: (org: Organization) => void;
}

interface OrgNameInputBodyProps {
  display: AvatarDisplay;
  orgName: string;
  error: string | null;
  onOrgNameChange: (value: string) => void;
  onSubmit: () => void;
  onShuffle: () => void;
  onUpload: (file: File, previewUrl: string) => void;
  onReset: () => void;
}

const OrgNameInputBody: FC<OrgNameInputBodyProps> = ({
  display,
  orgName,
  error,
  onOrgNameChange,
  onSubmit,
  onShuffle,
  onUpload,
  onReset,
}) => (
  <div className='flex items-center gap-6'>
    <div className='shrink-0'>
      <AvatarPicker avatar={display} onShuffle={onShuffle} onUpload={onUpload} onReset={onReset} triggerSize={96} />
    </div>
    <div className='min-w-0 flex-1 space-y-3'>
      <label className='f-14-500 text-GRAY_800 block leading-snug'>
        What do you want to call your new organization?
      </label>
      <Input
        type='text'
        value={orgName}
        autoFocus
        onChange={(e) => onOrgNameChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === KEYBOARD_KEYS.ENTER) onSubmit();
        }}
        placeholder='e.g. Acme Inc'
        maxLength={VALIDATION.ORG_NAME_MAX}
      />
      {error && <p className='f-12-400 text-RED_600'>{error}</p>}
    </div>
  </div>
);

interface ProvisioningBodyProps {
  step: ModalStep.PROVISIONING | ModalStep.TAKING_LONGER;
  display: AvatarDisplay;
  displayName: string;
  expectedSecs: number | null;
  error: string | null;
}

const ProvisioningBody: FC<ProvisioningBodyProps> = ({ step, display, displayName, expectedSecs, error }) => (
  <div className='flex flex-col items-center gap-4 py-4'>
    {error ? (
      <ErrorCard className='w-full' />
    ) : (
      <>
        <AvatarImage avatar={display} size={56} />
        {step === ModalStep.PROVISIONING && <Loader size={SIZE.SMALL} />}
        <div className='space-y-1 text-center'>
          <p className='f-14-500 text-GRAY_900'>
            {step === ModalStep.TAKING_LONGER ? (
              'Taking a bit longer than expected'
            ) : (
              <>
                Setting up <strong>{displayName || 'your workspace'}</strong>
              </>
            )}
          </p>
          {step === ModalStep.TAKING_LONGER ? (
            <p className='f-13-400 text-GRAY_600'>{"We'll drop you an email once it's done."}</p>
          ) : (
            expectedSecs != null && (
              <p className='f-13-400 text-GRAY_600'>{`This usually takes less than ${expectedSecs} seconds.`}</p>
            )
          )}
        </div>
      </>
    )}
  </div>
);

const CreateOrgModal: FC<CreateOrgModalProps> = ({ open, onClose, orgToProvision, onOrgReady }) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user.user);
  const username = user?.username ?? user?.user_email?.split('@')[0] ?? 'user';

  const [step, setStep] = useState<ModalStep>(ModalStep.INPUT);
  const [orgName, setOrgName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [expectedSecs, setExpectedSecs] = useState<number | null>(null);
  const [activeOrgToProvision, setActiveOrgToProvision] = useState(orgToProvision);

  const [registerOrg] = useRegisterOrgMutation();
  const [provisionOrg] = useProvisionOrgMutation();
  const [fetchWhoAmI] = useLazyWhoAmIQuery();

  const { display, updateSeed, handleShuffle, handleUpload, handleReset, uploadImage } = useOrgAvatarState({
    initialValue: `${username}_org`,
    generateSvg: generateOrgIconSvg,
    uploadType: UploadType.ORG_ICON,
    defaultName: `${username}_org`,
  });

  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPollingRef = useRef(false);

  const stopPolling = useCallback(() => {
    isPollingRef.current = false;

    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  const refreshSession = useCallback(async () => {
    const refreshed = await fetchWhoAmI(undefined, false).unwrap();

    dispatch(setUser(refreshed));
  }, [dispatch, fetchWhoAmI]);

  const runProvisionPoll = useCallback(
    async (org: Organization) => {
      setDisplayName(org.name);
      setStep(ModalStep.PROVISIONING);
      setError(null);
      isPollingRef.current = true;

      const scheduleNext = () => {
        if (!isPollingRef.current) return;

        pollTimerRef.current = setTimeout(() => void pollOnce(), PROVISIONING_POLL_INTERVAL_MS);
      };

      const pollOnce = async () => {
        if (!isPollingRef.current) return;

        try {
          const result = await provisionOrg(org.organization_id).unwrap();

          setError(null);

          if (result.is_completed || result.provisioning_status === PROVISIONING_STATUS.COMPLETED) {
            stopPolling();
            await refreshSession();
            onOrgReady(org);

            return;
          }

          if (result.expected_completion_seconds != null) {
            setExpectedSecs(result.expected_completion_seconds);

            if (result.started_at) {
              const elapsed = (Date.now() - new Date(result.started_at).getTime()) / 1000;

              if (elapsed > result.expected_completion_seconds) {
                setStep(ModalStep.TAKING_LONGER);
              }
            }
          }
        } catch {
          setError(ERROR_MESSAGES.GENERIC);
        }

        scheduleNext();
      };

      await pollOnce();
    },
    [onOrgReady, provisionOrg, refreshSession, stopPolling],
  );

  const handleSubmitCreate = async () => {
    const trimmed = orgName.trim();

    if (!trimmed || isSubmitting) return;

    if (trimmed.length > VALIDATION.ORG_NAME_MAX) {
      setError(ERROR_MESSAGES.ORG_NAME_MAX_LENGTH);

      return;
    }

    if (!user?.user_id) {
      setError(ERROR_MESSAGES.GENERIC);

      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const { type, value } = await uploadImage();

      const reg = await registerOrg({
        organization_name: trimmed,
        owner_id: user.user_id,
        icon_type: type ?? MEDIA_TYPE.SEED,
        icon_value: value ?? trimmed,
      }).unwrap();

      setIsSubmitting(false);

      const newOrg: Organization = {
        organization_id: reg.organization.organization_id,
        name: reg.organization.name,
        slug: reg.organization.slug,
        product: reg.organization.product as Organization['product'],
        provisioning_status: reg.organization.provisioning_status,
        resource_audience_policies: [],
      };

      await runProvisionPoll(newOrg);
    } catch {
      setError(ERROR_MESSAGES.GENERIC);
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (next: boolean) => {
    if (next) return;

    if (step === ModalStep.PROVISIONING && !error) return;

    onClose();
  };

  const handleDismissTakingLonger = () => {
    stopPolling();
    onClose();
  };

  const handleOrgNameChange = (value: string) => {
    setOrgName(value);
    setError(null);
    updateSeed(value);
  };

  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  useEffect(() => {
    if (!open) {
      stopPolling();

      return;
    }

    setStep(ModalStep.INPUT);
    setOrgName('');
    setError(null);
    setIsSubmitting(false);
    setDisplayName('');
    setExpectedSecs(null);
    setActiveOrgToProvision(orgToProvision ?? null);
    handleReset();

    if (!orgToProvision?.organization_id || orgToProvision.provisioning_status === PROVISIONING_STATUS.COMPLETED) {
      return;
    }

    void runProvisionPoll(orgToProvision);
  }, [open, orgToProvision, handleReset, runProvisionPoll, stopPolling]);

  const isProvisioning = step === ModalStep.PROVISIONING || step === ModalStep.TAKING_LONGER;
  const isLocked = step === ModalStep.PROVISIONING && !error;
  const title = step === ModalStep.INPUT ? 'New organization' : 'Setting up your workspace';

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        size='small'
        className='z-[10050] w-[min(520px,calc(100vw-24px))] outline-none'
        onOpenAutoFocus={() => {}}
        showCloseButton={!isLocked}
        onPointerDownOutside={(e) => {
          if (isLocked) e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          if (isLocked) e.preventDefault();
        }}
        dialogueOverlayClassName='z-[10049]'
      >
        <DialogHeader className='f-16-600 text-GRAY_950'>{title}</DialogHeader>
        <DialogBody className='px-6 py-8'>
          {step === ModalStep.INPUT && !orgToProvision && !activeOrgToProvision && (
            <OrgNameInputBody
              display={display}
              orgName={orgName}
              error={error}
              onOrgNameChange={handleOrgNameChange}
              onSubmit={() => void handleSubmitCreate()}
              onShuffle={() => handleShuffle(orgName)}
              onUpload={handleUpload}
              onReset={handleReset}
            />
          )}
          {isProvisioning && (
            <ProvisioningBody
              step={step as ModalStep.PROVISIONING | ModalStep.TAKING_LONGER}
              display={display}
              displayName={displayName}
              expectedSecs={expectedSecs}
              error={error}
            />
          )}
        </DialogBody>
        {step === ModalStep.INPUT && (
          <DialogFooter>
            <div className='flex w-full justify-end gap-2'>
              <Button variant='secondary' size='small' onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                variant='default'
                size='small'
                onClick={() => void handleSubmitCreate()}
                disabled={!orgName.trim() || isSubmitting}
                isLoading={isSubmitting}
              >
                Create
              </Button>
            </div>
          </DialogFooter>
        )}
        {step === ModalStep.TAKING_LONGER && (
          <DialogFooter>
            <div className='flex w-full justify-end'>
              <Button variant='secondary' size='small' onClick={handleDismissTakingLonger}>
                Close
              </Button>
            </div>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreateOrgModal;
