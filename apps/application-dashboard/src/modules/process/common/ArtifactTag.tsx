import type { FC } from 'react';
import { Button } from '@zamp-platform/ui';
import { ARTIFACT_TYPE } from 'modules/process/process.types';
import { getArtifactPrefixIconSrc } from 'modules/process/process.utils';
import Image from 'next/image';
import { cn } from 'utils/common';

interface ArtifactTagProps {
  displayName: string;
  onClick: () => void;
  displayClassName?: string;
  artifactType: ARTIFACT_TYPE;
  iconIdentifier?: string;
}

const ArtifactTag: FC<ArtifactTagProps> = ({
  displayName,
  onClick,
  displayClassName,
  artifactType,
  iconIdentifier,
}) => {
  const iconSrc = getArtifactPrefixIconSrc(artifactType, iconIdentifier);

  return (
    <Button
      variant={'ghost'}
      className='bg-GRAY_100 flex h-6 cursor-pointer items-center justify-start gap-x-1.5 rounded px-2 py-1'
      onClick={onClick}
    >
      <Image src={iconSrc} alt={displayName} width={12} height={12} priority />
      <p className={cn('f-12-450 text-GRAY_1000 truncate', displayClassName)} title={displayName}>
        {displayName}
      </p>
    </Button>
  );
};

export default ArtifactTag;
