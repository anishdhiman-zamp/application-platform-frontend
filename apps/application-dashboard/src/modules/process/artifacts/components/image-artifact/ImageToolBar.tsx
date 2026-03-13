import type { FC } from 'react';
import { COLORS } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { ZoomIn, ZoomOut } from 'lucide-react';

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
        <ZoomOut
          size={14}
          color={isMinZoom ? COLORS.GRAY_600 : COLORS.WHITE}
          onClick={isMinZoom ? undefined : onZoomOut}
          className={cn('cursor-pointer rounded p-0.5', isMinZoom && 'cursor-not-allowed opacity-50')}
        />

        {/* Zoom Level Display */}
        <span className='f-11-500 min-w-[40px] text-center text-white select-none'>{Math.round(scale * 100)}%</span>

        {/* Zoom In */}
        <ZoomIn
          size={14}
          color={isMaxZoom ? COLORS.GRAY_600 : COLORS.WHITE}
          onClick={isMaxZoom ? undefined : onZoomIn}
          className={cn('cursor-pointer rounded p-0.5', isMaxZoom && 'cursor-not-allowed opacity-50')}
        />
      </div>
    </div>
  );
};

export default ImageToolBar;
