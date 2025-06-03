import { SvgSpriteLoader } from '@zamp-platform/ui/assets';

const CustomNoRowsOverlay = () => {
  return (
    <div
      role='presentation'
      className='text-GRAY_700 f-12-450 flex h-full flex-col items-center justify-center gap-2.5'
    >
      <SvgSpriteLoader id='coins-stacked-03' width={24} height={24} />
      <div>No data available, try again with different filters</div>
    </div>
  );
};

export default CustomNoRowsOverlay;
