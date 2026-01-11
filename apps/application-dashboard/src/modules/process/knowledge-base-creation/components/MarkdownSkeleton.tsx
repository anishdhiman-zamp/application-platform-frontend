'use client';

import { FC, memo } from 'react';
import ImageLoader from '@/components/common/loader/ImageLoader';
import { ZAMP_LOGO_LOADER_SVG } from '@/constants/icons';

interface MarkdownSkeletonProps {
  size?: number;
}

const MarkdownSkeleton: FC<MarkdownSkeletonProps> = ({ size = 140 }) => {
  return (
    <div className='flex h-full min-h-[calc(100vh-88px)] w-full items-center justify-center'>
      <ImageLoader imageSrc={ZAMP_LOGO_LOADER_SVG} width={size} height={size} className='rounded-tl-xl' />
    </div>
  );
};

MarkdownSkeleton.displayName = 'MarkdownSkeleton';

export default memo(MarkdownSkeleton);
