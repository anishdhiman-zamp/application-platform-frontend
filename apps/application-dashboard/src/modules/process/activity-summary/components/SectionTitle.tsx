import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { COLORS } from '@/constants/colors';

const SectionTitle = ({ title }: { title: string }) => {
  return (
    <div className='flex items-center justify-start w-full gap-x-1'>
      <SvgSpriteLoader id='coins-stacked-04' color={COLORS.GRAY_700} size={12} />
      <p className='f-12-550 text-GRAY_900 py-1.5 capitalize'>{title}</p>
    </div>
  );
};

export default SectionTitle;
