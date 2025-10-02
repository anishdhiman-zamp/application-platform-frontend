import type { FC } from 'react';
import { memo } from 'react';
import { Button } from '@zamp-platform/ui';
import { ARTIFACT_TYPE, type CTA_ACTION } from 'modules/process/process.types';
import { getArtifactPrefixIconSrc } from 'modules/process/process.utils';
import Image from 'next/image';
import { cn } from 'utils/common';
import ImageWithFallback from '@/components/common/ImageWithFallback';
import TooltipV2 from '@/components/common/TooltipV2';
import { DATASET, LINK, REDIRECT } from '@/constants/icons';
import type { defaultFnType } from '@/types/commonTypes';

interface ArtifactTagProps {
  displayName: string;
  onClick: defaultFnType;
  displayClassName?: string;
  buttonClassName?: string;
  artifactType: ARTIFACT_TYPE;
  iconIdentifier?: string;
  ctaAction?: CTA_ACTION;
}

const ArtifactTag: FC<ArtifactTagProps> = ({
  displayName,
  onClick,
  displayClassName,
  buttonClassName,
  artifactType,
  iconIdentifier,
  ctaAction,
}) => {
  const iconSrc = getArtifactPrefixIconSrc(artifactType, iconIdentifier, ctaAction);

  return (
    <Button
      variant={'ghost'}
      className={cn(
        'bg-GRAY_100 flex h-6 cursor-pointer items-center justify-start gap-x-1.5 rounded px-2 py-1',
        buttonClassName,
      )}
      onClick={onClick}
    >
      <ImageWithFallback
        fallback={artifactType === ARTIFACT_TYPE.EXTERNAL_LINK ? LINK : DATASET}
        src={iconSrc}
        alt={displayName}
        width={12}
        height={12}
        priority
      />
      <TooltipV2 tooltipBody={displayName} showOnlyWhenTruncated asChildTrigger>
        <p className={cn('f-12-450 text-GRAY_1000 truncate', displayClassName)}>{displayName}</p>
      </TooltipV2>
      {artifactType === ARTIFACT_TYPE.EXTERNAL_LINK && (
        <Image src={REDIRECT} alt='redirect' width={11} height={11} priority className='-mt-[1px] shrink-0' />
      )}
    </Button>
  );
};

export default memo(ArtifactTag);
