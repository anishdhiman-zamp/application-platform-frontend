import { Button } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { ARTIFACT_ICON_MAPPING } from 'modules/process/process.constant';
import type { MapAny } from '@/types/commonTypes';

const ArtifactTag = ({ data }: { data: MapAny }) => {
  return (
    <Button
      variant={'ghost'}
      className='flex items-center h-6 justify-start gap-x-1.5 px-2 py-1 bg-GRAY_100 rounded-[4px] cursor-pointer'
    >
      <SvgSpriteLoader
        id={ARTIFACT_ICON_MAPPING[data?.artifact_type as keyof typeof ARTIFACT_ICON_MAPPING]?.id}
        width={12}
        height={12}
      />
      <p className='f-12-450 text-GRAY_1000 max-w-40 truncate' title={data?.display_name}>
        {data?.display_name}
      </p>
    </Button>
  );
};

export default ArtifactTag;
