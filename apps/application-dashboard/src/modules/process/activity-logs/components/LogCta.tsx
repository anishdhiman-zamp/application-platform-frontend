import { type FC, memo, useState } from 'react';
import { Button, type ButtonProps } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import ArtifactTag from 'modules/process/common/ArtifactTag';
import { type ARTIFACT_TYPE, type CTA_ACTION, CTA_COMPONENT_TYPE } from 'modules/process/process.types';
import { useEmitHITLActionMutation } from '@/apis/processes';
import { toast } from '@/components/common/toast/Toast';
import { useAppSelector } from '@/hooks/toolkit';
import type { CtasType } from '@/types/api/processApi.types';
import type { MapAny } from '@/types/commonTypes';

type LogCtaProps = {
  ctas: CtasType[];
  logGroupId: string;
  handleShowArtifacts: (artifactType: ARTIFACT_TYPE, artifactId: string, action?: CTA_ACTION, filters?: MapAny) => void;
  processId: string;
  activityId: string;
};

const LogCta: FC<LogCtaProps> = ({ ctas, logGroupId, handleShowArtifacts, processId, activityId }) => {
  const userId = useAppSelector((state) => state.user.user?.user_id);
  const [ctaLoading, setCtaLoading] = useState<string[]>([]);

  const artifactTypeCta = ctas.filter((cta) => cta.cta_component_type === CTA_COMPONENT_TYPE.ARTIFACT);
  const buttonTypeCta = ctas.filter((cta) => cta.cta_component_type === CTA_COMPONENT_TYPE.BUTTON);

  const [emitHITLAction, { isLoading }] = useEmitHITLActionMutation();

  const handleEmitHITLAction = (cta: CtasType) => {
    const payload = {
      hitl_request_id: cta?.hitl_request_id,
      log_group_id: logGroupId,
      submitted_by: userId ?? '',
      responses: [{ action_id: cta?.cta_action_id, values: [cta?.cta_value] }],
    };

    setCtaLoading((prev) => [...prev, cta?.id]);

    emitHITLAction({
      processId,
      activityRunId: activityId,
      payload,
    })
      .unwrap()
      .then(() => {
        setCtaLoading((prev) => prev.filter((id) => id !== cta?.id));
      })
      .catch((error) => {
        toast.error(error.data.message ?? 'Something went wrong');
        setCtaLoading((prev) => prev.filter((id) => id !== cta?.id));
      });
  };

  return (
    <div className='mt-3 flex w-full flex-col items-start justify-start gap-y-2'>
      <div className='flex w-full flex-wrap items-start justify-start gap-2'>
        {artifactTypeCta?.map((cta) => (
          <ArtifactTag
            key={cta?.id}
            displayName={cta?.display_name}
            artifactType={cta?.artifact_type}
            iconIdentifier={cta?.cta_config?.icon_identifier}
            ctaAction={cta?.cta_action}
            onClick={() =>
              handleShowArtifacts(cta?.artifact_type, cta?.id ?? '', cta?.cta_action, cta?.filter_metadata)
            }
            displayClassName='max-w-40'
          />
        ))}
      </div>
      <div className='flex w-full flex-wrap items-start justify-start gap-2'>
        {buttonTypeCta?.map((cta) => (
          <Button
            variant={(cta?.cta_config?.variant as ButtonProps['variant']) ?? 'secondary'}
            key={cta?.id}
            className='f-12-500 h-6 gap-x-1.5 px-2.5 py-1.5 whitespace-nowrap'
            onClick={() => handleEmitHITLAction(cta)}
            disabled={isLoading || ctaLoading.includes(cta?.id)}
            isLoading={isLoading && ctaLoading.includes(cta?.id)}
          >
            {cta?.cta_config?.icon_identifier && (
              <SvgSpriteLoader id={cta?.cta_config?.icon_identifier ?? 'check'} size={12} className='shrink-0' />
            )}
            <span className='f-12-500 truncate capitalize'>{cta?.display_name}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default memo(LogCta);
