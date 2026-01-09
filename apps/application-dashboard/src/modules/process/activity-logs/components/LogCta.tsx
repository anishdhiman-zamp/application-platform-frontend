import { type ForwardedRef, forwardRef, memo, useCallback, useImperativeHandle, useMemo, useState } from 'react';
import ConditionalRevealAnimation from 'modules/process/activity-logs/components/ConditionalRevealAnimationWrapper';
import CtaArtifactTag from 'modules/process/activity-logs/components/CtaArtifactTag';
import CtaButton from 'modules/process/activity-logs/components/CtaButton';
import { ARTIFACT_SHOW_CTA_TYPES, BUTTON_TYPE_CTA_COMPONENTS } from 'modules/process/process.constant';
import { CTA_ACTION, CTA_COMPONENT_TYPE, type HandleShowArtifactsProps } from 'modules/process/process.types';
import { buildHITLPayload, getCtaLoadingId, serializeFormData } from 'modules/process/process.utils';
import { useEmitHITLActionMutation } from '@/apis/processes';
import { toast } from '@/components/common/toast/Toast';
import { useAppSelector } from '@/hooks/toolkit';
import type { CtasType } from '@/types/api/processApi.types';
import type { defaultFnType } from '@/types/commonTypes';

export interface LogCtaRef {
  submitFormData: (formData: Record<string, unknown>) => void;
}

interface LogCtaProps {
  ctas: CtasType[];
  logGroupId: string;
  handleShowArtifacts: (props: HandleShowArtifactsProps) => void;
  processId: string;
  activityId: string;
  isLastLog?: boolean;
  onSubmitForm?: defaultFnType;
}

// Main component
const LogCtaComponent = (
  { ctas, logGroupId, handleShowArtifacts, processId, activityId, isLastLog = false, onSubmitForm }: LogCtaProps,
  ref: ForwardedRef<LogCtaRef>,
) => {
  const userId = useAppSelector((state) => state.user.user?.user_id);
  const [ctaLoading, setCtaLoading] = useState<string[]>([]);
  const [emitHITLAction, { isLoading, isSuccess }] = useEmitHITLActionMutation();

  const artifactTypeCtas = useMemo(
    () => ctas.filter((cta) => cta.cta_component_type === CTA_COMPONENT_TYPE.ARTIFACT),
    [ctas],
  );

  const buttonTypeCtas = useMemo(
    () => ctas.filter((cta) => BUTTON_TYPE_CTA_COMPONENTS.includes(cta.cta_component_type)),
    [ctas],
  );

  const isMultipleButtons = buttonTypeCtas.length > 1;

  const handleEmitHITLAction = useCallback(
    (cta: CtasType, customValues?: Array<string>) => {
      const payload = buildHITLPayload(cta, logGroupId, userId ?? '', customValues);
      const loadingId = getCtaLoadingId(cta);

      setCtaLoading((prev) => [...prev, loadingId]);

      emitHITLAction({ processId, activityRunId: activityId, payload })
        .unwrap()
        .then(() => {
          setCtaLoading((prev) => prev.filter((id) => id !== loadingId));
        })
        .catch((error) => {
          toast.error(error?.data?.message ?? 'Something went wrong');
          setCtaLoading((prev) => prev.filter((id) => id !== loadingId));
        });
    },
    [logGroupId, userId, emitHITLAction, processId, activityId],
  );

  const submitFormData = useCallback(
    (formData: Record<string, unknown>) => {
      const targetCta = buttonTypeCtas.find((cta) => cta?.cta_action === CTA_ACTION.SUBMIT_FORM);

      if (!targetCta) {
        toast.error('No CTA available for form submission');

        return;
      }
      handleEmitHITLAction(targetCta, serializeFormData(formData));
    },
    [buttonTypeCtas, handleEmitHITLAction],
  );

  const handleButtonClick = useCallback(
    (cta: CtasType) => {
      const shouldShowArtifacts = ARTIFACT_SHOW_CTA_TYPES.includes(cta?.cta_component_type);
      const isSubmitAction = cta?.cta_action === CTA_ACTION.SUBMIT_FORM;

      if (shouldShowArtifacts) {
        handleShowArtifacts({
          artifactType: cta?.artifact_type,
          artifactId: cta?.id ?? '',
          filters: cta?.filter_metadata,
          ctaConfig: cta?.cta_config,
          logGroupId,
          hitlRequestId: cta?.hitl_request_id,
          ctaActionId: cta?.cta_action_id,
        });
      } else if (isSubmitAction) {
        onSubmitForm?.();
      } else {
        handleEmitHITLAction(cta);
      }
    },
    [handleShowArtifacts, logGroupId, handleEmitHITLAction, onSubmitForm],
  );

  const handleArtifactClick = useCallback(
    (cta: CtasType) => {
      handleShowArtifacts({
        artifactType: cta?.artifact_type,
        artifactId: cta?.id ?? '',
        action: cta?.cta_action,
        filters: cta?.filter_metadata,
      });
    },
    [handleShowArtifacts],
  );

  // Expose ref methods
  useImperativeHandle(ref, () => ({ submitFormData }), [submitFormData]);

  return (
    <div className='mt-3 flex w-full flex-col items-start justify-start gap-y-2'>
      {artifactTypeCtas.length > 0 && (
        <ConditionalRevealAnimation
          className='flex w-full flex-wrap items-start justify-start gap-2'
          isLastLog={isLastLog}
        >
          {artifactTypeCtas.map((cta) => (
            <CtaArtifactTag key={cta.id} cta={cta} onShowArtifacts={() => handleArtifactClick(cta)} />
          ))}
        </ConditionalRevealAnimation>
      )}

      {buttonTypeCtas.length > 0 && (
        <ConditionalRevealAnimation
          className='flex w-full flex-wrap items-start justify-start gap-2'
          isLastLog={isLastLog}
        >
          {buttonTypeCtas.map((cta) => {
            const loadingId = getCtaLoadingId(cta);

            return (
              <CtaButton
                key={loadingId}
                cta={cta}
                isMultiple={isMultipleButtons}
                isLoading={isLoading}
                isCtaLoading={ctaLoading.includes(loadingId)}
                isSuccess={isSuccess}
                onClick={() => handleButtonClick(cta)}
              />
            );
          })}
        </ConditionalRevealAnimation>
      )}
    </div>
  );
};

const LogCta = memo(forwardRef(LogCtaComponent));

export default LogCta;
