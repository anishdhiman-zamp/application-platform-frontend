import type { FC } from 'react';
import { Button } from '@zamp-platform/ui';
import { ARTIFACT_ICON_MAPPING } from 'modules/process/process.constant';
import { ARTIFACT_TYPE } from 'modules/process/process.types';
import Image from 'next/image';
import { cn } from 'utils/common';

interface ArtifactTagProps {
  displayName: string;
  type: string;
  onClick: () => void;
  displayClassName?: string;
}

const ArtifactTag: FC<ArtifactTagProps> = ({ displayName, type, onClick, displayClassName }) => {
  return (
    <Button
      variant={'ghost'}
      className='flex items-center h-6 justify-start gap-x-1.5 px-2 py-1 bg-GRAY_100 rounded cursor-pointer'
      onClick={onClick}
    >
      <Image
        src={
          ARTIFACT_ICON_MAPPING[type as keyof typeof ARTIFACT_ICON_MAPPING]?.icon_url ??
          ARTIFACT_ICON_MAPPING[ARTIFACT_TYPE.PDF_DATASET]?.icon_url
        }
        alt={displayName}
        width={12}
        height={12}
        priority
      />
      <p className={cn('f-12-450 text-GRAY_1000 truncate', displayClassName)} title={displayName}>
        {displayName}
      </p>
    </Button>
  );
};

export default ArtifactTag;
