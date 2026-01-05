'use client';

import { memo } from 'react';
import ImageLoader from '@/components/common/loader/ImageLoader';
import { ZAMP_LOGO_LOADER_SVG } from '@/constants/icons';

/**
 * Skeleton component for markdown content to reduce Cumulative Layout Shift (CLS)
 * while loading markdown plugins and content
 */
const MarkdownSkeleton = memo(() => (
  <div className='flex h-full min-h-[calc(100vh-88px)] w-full items-center justify-center'>
    <ImageLoader imageSrc={ZAMP_LOGO_LOADER_SVG} width={240} height={240} className='rounded-tl-xl' />
  </div>
));

MarkdownSkeleton.displayName = 'MarkdownSkeleton';

export default MarkdownSkeleton;
