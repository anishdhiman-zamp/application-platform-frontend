import type { FC } from 'react';
import { Button } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { ARTIFACT_ICON_MAPPING } from 'modules/process/process.constant';

interface ArtifactTagProps {
  displayName: string;
  type: string;
  onClick: () => void;
}

const ArtifactTag: FC<ArtifactTagProps> = ({ displayName, type, onClick }) => {
  return (
    <Button
      variant={'ghost'}
      className='flex items-center h-6 justify-start gap-x-1.5 px-2 py-1 bg-GRAY_100 rounded-[4px] cursor-pointer'
      onClick={onClick}
    >
      <SvgSpriteLoader
        id={ARTIFACT_ICON_MAPPING[type as keyof typeof ARTIFACT_ICON_MAPPING]?.id ?? 'file-02'}
        size={12}
      />
      <p className='f-12-450 text-GRAY_1000 max-w-40 truncate' title={displayName}>
        {displayName}
      </p>
    </Button>
  );
};

export default ArtifactTag;
