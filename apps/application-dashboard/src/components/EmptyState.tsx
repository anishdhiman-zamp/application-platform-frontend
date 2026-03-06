import { type ReactNode } from 'react';
import { cn } from '@zamp-platform/ui/utils';
import ImageKitImage from '@/components/ImageKitImage';

interface EmptyStateProps {
  imageSrc: string;
  imageAlt: string;
  title: string;
  description?: ReactNode;
  imageWidth?: number;
  imageHeight?: number;
  className?: string;
  children?: ReactNode;
}

const EmptyState = ({
  imageSrc,
  imageAlt,
  title,
  description,
  imageWidth = 160,
  imageHeight = 120,
  className,
  children,
}: EmptyStateProps) => {
  return (
    <div className={cn('flex h-full w-full flex-col items-center justify-center gap-y-3', className)}>
      <div className='relative flex items-center justify-center' style={{ width: imageWidth, height: imageHeight }}>
        <ImageKitImage
          src={imageSrc}
          alt={imageAlt}
          className='h-full w-full object-contain object-center'
          width={imageWidth}
          height={imageHeight}
        />
      </div>
      <div className='flex flex-col items-center gap-y-1'>
        <p className='f-14-500 text-GRAY_700'>{title}</p>
        {description && <p className='f-12-400 text-GRAY_600 max-w-[300px] text-center'>{description}</p>}
      </div>
      {children}
    </div>
  );
};

export default EmptyState;
