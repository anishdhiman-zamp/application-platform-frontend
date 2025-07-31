import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { ICON_SPRITE_TYPES } from '@zamp-platform/ui/types';
import { COLORS } from '@/constants/colors';

const DocumentPill = ({ value }: { value: string }) => {
  if (!value) return <span className='f-13-450 text-GRAY_500'>N/A</span>;

  return (
    <div className='bg-GRAY_100 flex w-fit items-center gap-1.5 rounded px-1.5 py-1'>
      <SvgSpriteLoader id='file-02' iconCategory={ICON_SPRITE_TYPES.FILES} size={12} color={COLORS.GRAY_1000} />
      <p className='f-11-450 text-GRAY_1000 max-w-[136px] truncate' title={value}>
        {value}
      </p>
    </div>
  );
};

export default DocumentPill;
