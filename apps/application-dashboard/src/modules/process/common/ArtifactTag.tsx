import { type FC, memo } from 'react';
import { Button, TooltipV2 } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { ExternalLink } from 'lucide-react';
import { ARTIFACT_TYPE, type CTA_ACTION } from 'modules/process/process.types';
import { getArtifactPrefixIconSrc } from 'modules/process/process.utils';
import Image from 'next/image';
import ImageWithFallback from '@/components/common/ImageWithFallback';
import { ARTIFACT_ICON_URL, GMAIL, LINK } from '@/constants/icons';
import type { defaultFnType } from '@/types/commonTypes';

interface ArtifactTagProps {
  displayName: string;
  artifactType: ARTIFACT_TYPE;
  onClick: defaultFnType;
  buttonClassName?: string;
  displayClassName?: string;
  iconIdentifier?: string;
  ctaAction?: CTA_ACTION;
  disabled?: boolean;
}

const ArtifactTag: FC<ArtifactTagProps> = ({
  displayName,
  artifactType,
  onClick,
  buttonClassName,
  displayClassName,
  iconIdentifier,
  ctaAction,
  disabled = false,
}) => {
  const isExternalLink = artifactType === ARTIFACT_TYPE.EXTERNAL_LINK;
  const isEmail = artifactType === ARTIFACT_TYPE.EMAIL;
  const Icon = getArtifactPrefixIconSrc(artifactType, ctaAction);

  const renderIcon = () => {
    if (isExternalLink) {
      return (
        <ImageWithFallback
          src={iconIdentifier ? `${ARTIFACT_ICON_URL}/${iconIdentifier}` : LINK}
          fallback={LINK}
          alt={displayName}
          width={12}
          height={12}
          priority
        />
      );
    }

    if (isEmail) {
      return <Image src={GMAIL} alt={displayName} width={12} height={12} priority />;
    }

    return Icon ? <Icon size={12} strokeWidth={1.8} className='shrink-0 p-px' /> : null;
  };

  return (
    <Button
      variant='ghost'
      className={cn(
        'bg-GRAY_100 flex h-6 items-center justify-start gap-x-1.5 rounded px-2 py-1',
        buttonClassName,
        disabled && 'pointer-events-auto! cursor-not-allowed opacity-70',
      )}
      disabled={disabled}
      onClick={onClick}
    >
      {renderIcon()}

      <TooltipV2 tooltipBody={displayName} showOnlyWhenTruncated asChildTrigger>
        <p className={cn('f-12-450 text-GRAY_1000 truncate', displayClassName)}>{displayName}</p>
      </TooltipV2>

      {isExternalLink && <ExternalLink size={12} className='shrink-0 p-px' strokeWidth={1.8} />}
    </Button>
  );
};

export default memo(ArtifactTag);
