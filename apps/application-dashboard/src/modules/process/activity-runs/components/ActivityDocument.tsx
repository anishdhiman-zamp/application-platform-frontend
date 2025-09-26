import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import TooltipV2 from '@/components/common/TooltipV2';
import { COLORS } from '@/constants/colors';

interface ActivityDocumentProps {
  value: string;
}

const ActivityDocument = ({ value }: ActivityDocumentProps) => {
  if (!value) return <span className='f-13-450 text-GRAY_500'>N/A</span>;

  return (
    <div className='bg-GRAY_100 flex max-w-fit min-w-0 items-center gap-1.5 rounded px-1.5 py-1'>
      <SvgSpriteLoader id='file-02' size={12} color={COLORS.GRAY_1000} className='flex-shrink-0' />
      <TooltipV2 tooltipBody={value} asChildTrigger showOnlyWhenTruncated>
        <p className='f-11-450 text-GRAY_1000 truncate'>{value}</p>
      </TooltipV2>
    </div>
  );
};

export default ActivityDocument;
