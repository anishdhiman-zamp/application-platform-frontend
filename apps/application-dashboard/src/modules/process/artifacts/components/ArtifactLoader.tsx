import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { COLORS } from '@/constants/colors';

const ArtifactLoader = () => {
  return (
    <div className='bg-BG_GRAY_1 flex h-full w-full flex-col items-center justify-center gap-y-1'>
      <SvgSpriteLoader id='stand' size={14} color={COLORS.GRAY_600} />
      <span className='f-13-450 text-GRAY_600 animate-pulse'>Loading artifact...</span>
    </div>
  );
};

export default ArtifactLoader;
