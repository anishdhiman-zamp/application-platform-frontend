import { CSS_VARS } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';

const SectionTitle = ({ title }: { title: string }) => {
  return (
    <div className='flex w-full items-center justify-start gap-x-1'>
      <SvgSpriteLoader id='coins-stacked-04' color={CSS_VARS.GRAY_700} size={12} />
      <p className='f-12-550 text-GRAY_900 py-1.5 capitalize'>{title}</p>
    </div>
  );
};

export default SectionTitle;
