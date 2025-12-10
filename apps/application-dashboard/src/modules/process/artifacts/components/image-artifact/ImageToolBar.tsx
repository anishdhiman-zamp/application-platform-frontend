import type { FC } from 'react';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { cn } from '@zamp-platform/ui/utils';
import { COLORS } from '@/constants/colors';

interface ImageToolBarProps {
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  minScale?: number;
  maxScale?: number;
  className?: string;
}

const ImageToolBar: FC<ImageToolBarProps> = ({
  scale,
  onZoomIn,
  onZoomOut,
  minScale = 0.5,
  maxScale = 3.0,
  className,
}) => {
  const isMinZoom = scale <= minScale;
  const isMaxZoom = scale >= maxScale;

  return (
    <div
      className={cn(
        'absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 transform items-center rounded-md bg-black whitespace-nowrap',
        className,
      )}
    >
      <div className='flex items-center justify-center gap-x-1.5 px-2.5 py-1.5'>
        {/* Zoom Out */}
        <SvgSpriteLoader
          id='zoom-out'
          color={isMinZoom ? COLORS.GRAY_600 : COLORS.WHITE}
          size={12}
          onClick={isMinZoom ? undefined : onZoomOut}
          className={cn('cursor-pointer rounded p-0.5', isMinZoom && 'cursor-not-allowed opacity-50')}
        />

        {/* Zoom Level Display */}
        <span className='f-11-500 min-w-[40px] text-center text-white select-none'>{Math.round(scale * 100)}%</span>

        {/* Zoom In */}
        <SvgSpriteLoader
          id='zoom-in'
          color={isMaxZoom ? COLORS.GRAY_600 : COLORS.WHITE}
          size={12}
          onClick={isMaxZoom ? undefined : onZoomIn}
          className={cn('cursor-pointer rounded p-0.5', isMaxZoom && 'cursor-not-allowed opacity-50')}
        />
      </div>
    </div>
  );
};

export default ImageToolBar;
