import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { COLORS } from '@/constants/colors';
import { ICON_SPRITE_TYPES } from '@/constants/icons';

const DocumentPill = ({ value }: { value: string }) => {
  return (
    <div className='rounded-[4px] bg-GRAY_100 px-1.5 py-1 gap-1.5 flex items-center'>
      <SvgSpriteLoader
        id='file-02'
        iconCategory={ICON_SPRITE_TYPES.FILES}
        width={12}
        height={12}
        color={COLORS.GRAY_1000}
      />
      <p className='f-11-450 text-GRAY_1000'>{value}</p>
    </div>
  );
};

export default DocumentPill;
