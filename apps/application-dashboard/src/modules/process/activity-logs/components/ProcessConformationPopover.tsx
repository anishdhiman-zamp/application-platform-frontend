import { Button, COLORS } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';

const ProcessConformationPopover = () => {
  return (
    <div className='shadow-overlay f-12-500 m-auto mb-2 flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-2'>
      <div>If everything looks good</div>
      <Button size='small'>
        <SvgSpriteLoader id='check' size={14} color={COLORS.WHITE} className='mr-1.5' />
        Move to Done
      </Button>
    </div>
  );
};

export default ProcessConformationPopover;
