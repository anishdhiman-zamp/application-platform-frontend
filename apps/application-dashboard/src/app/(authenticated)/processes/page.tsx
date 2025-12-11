'use client';

import ImageLoader from '@/components/common/loader/ImageLoader';
import { ZAMP_LOGO_LOADER_SVG } from '@/constants/icons';

/**
 * Processes page - navigation logic is handled by PagesAndProcessesProvider
 * at the layout level, so no need for navigation logic here.
 */
export default function Page() {
  return <ImageLoader imageSrc={ZAMP_LOGO_LOADER_SVG} width={140} height={140} className='rounded-tl-xl' />;
}
