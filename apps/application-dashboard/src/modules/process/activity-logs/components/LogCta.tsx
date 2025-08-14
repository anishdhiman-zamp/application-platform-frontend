import { type FC, memo, useCallback, useState } from 'react';
import { Button } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import ConditionalRevealAnimation from 'modules/process/activity-logs/components/ConditionalRevealAnimationWrapper';
import ArtifactTag from 'modules/process/common/ArtifactTag';
import { CTA_COMPONENT_TYPE, type HandleShowArtifactsProps } from 'modules/process/process.types';
import { useEmitHITLActionMutation } from '@/apis/processes';
import { toast } from '@/components/common/toast/Toast';
import { useAppSelector } from '@/hooks/toolkit';
import type { CtasType } from '@/types/api/processApi.types';
import { capitalizeFirstLetter } from '@/utils/common';

type LogCtaProps = {
  ctas: CtasType[];
  logGroupId: string;
  handleShowArtifacts: (props: HandleShowArtifactsProps) => void;
  processId: string;
  activityId: string;
  isLastLog?: boolean;
};

const LogCta: FC<LogCtaProps> = ({
  ctas,
  logGroupId,
  handleShowArtifacts,
  processId,
  activityId,
  isLastLog = false,
}) => {
  const userId = useAppSelector((state) => state.user.user?.user_id);
  const [ctaLoading, setCtaLoading] = useState<string[]>([]);

  const artifactTypeCtas = ctas.filter((cta) => cta.cta_component_type === CTA_COMPONENT_TYPE.ARTIFACT);
  const buttonTypeCtas = ctas.filter((cta) =>
    [
      CTA_COMPONENT_TYPE.BUTTON,
      CTA_COMPONENT_TYPE.OVERRIDE_MISSING_FIELDS_BUTTON,
      CTA_COMPONENT_TYPE.REQUIRED_MISSING_FIELDS_BUTTON,
      CTA_COMPONENT_TYPE.EMAIL_DRAFT_SEND_BUTTON,
    ].includes(cta.cta_component_type),
  );

  const [emitHITLAction, { isLoading }] = useEmitHITLActionMutation();

  const getLoadingId = useCallback((cta: CtasType) => `${cta?.id}-${cta?.display_name}`, []);

  const handleEmitHITLAction = (cta: CtasType) => {
    const payload = {
      hitl_request_id: cta?.hitl_request_id,
      log_group_id: logGroupId,
      submitted_by: userId ?? '',
      responses: [
        {
          action_id: cta?.cta_action_id,
          values: [cta?.cta_value],
          cta_component_type: cta?.cta_component_type,
        },
      ],
    };

    const loadingId = getLoadingId(cta);

    setCtaLoading((prev) => [...prev, loadingId]);

    emitHITLAction({
      processId,
      activityRunId: activityId,
      payload,
    })
      .unwrap()
      .then(() => {
        setCtaLoading((prev) => prev.filter((id) => id !== loadingId));
      })
      .catch((error) => {
        toast.error(error?.data?.message ?? 'Something went wrong');
        setCtaLoading((prev) => prev.filter((id) => id !== loadingId));
      });
  };

  const handleButtonClick = (cta: CtasType) => {
    if (
      cta?.cta_component_type === CTA_COMPONENT_TYPE.REQUIRED_MISSING_FIELDS_BUTTON ||
      cta?.cta_component_type === CTA_COMPONENT_TYPE.EMAIL_DRAFT_SEND_BUTTON
    ) {
      handleShowArtifacts({
        artifactType: cta?.artifact_type,
        artifactId: cta?.id ?? '',
        action: cta?.cta_action,
        filters: cta?.filter_metadata,
        ctaConfig: cta?.cta_config,
        logGroupId,
        hitlRequestId: cta?.hitl_request_id,
        ctaActionId: cta?.cta_action_id,
      });
    } else {
      handleEmitHITLAction(cta);
    }
  };

  return (
    <div className='mt-3 flex w-full flex-col items-start justify-start gap-y-2'>
      <ConditionalRevealAnimation
        className='flex w-full flex-wrap items-start justify-start gap-2'
        isLastLog={isLastLog}
      >
        {artifactTypeCtas?.map((cta) => (
          <ArtifactTag
            key={cta?.id}
            displayName={cta?.display_name}
            artifactType={cta?.artifact_type}
            iconIdentifier={cta?.cta_config?.icon_identifier}
            ctaAction={cta?.cta_action}
            onClick={() =>
              handleShowArtifacts({
                artifactType: cta?.artifact_type,
                artifactId: cta?.id ?? '',
                action: cta?.cta_action,
                filters: cta?.filter_metadata,
              })
            }
            displayClassName='max-w-40'
          />
        ))}
      </ConditionalRevealAnimation>
      <ConditionalRevealAnimation
        className='flex w-full flex-wrap items-start justify-start gap-2'
        isLastLog={isLastLog}
      >
        {buttonTypeCtas?.map((cta) => {
          const loadingId = getLoadingId(cta);

          return (
            <Button
              variant={buttonTypeCtas?.length > 1 ? 'secondary' : 'default'}
              key={loadingId}
              className='f-12-500 h-6 gap-x-1.5 px-2.5 py-1.5'
              onClick={() => handleButtonClick(cta)}
              disabled={isLoading || ctaLoading.includes(loadingId)}
              isLoading={isLoading && ctaLoading.includes(loadingId)}
            >
              {cta?.cta_config?.icon_identifier && (
                <SvgSpriteLoader id={cta?.cta_config?.icon_identifier} size={12} className='shrink-0' />
              )}
              <span className='f-12-500'>{capitalizeFirstLetter(cta?.display_name)}</span>
            </Button>
          );
        })}
      </ConditionalRevealAnimation>
    </div>
  );
};

export default memo(LogCta);
