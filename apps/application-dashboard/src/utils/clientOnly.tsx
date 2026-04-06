import type { ComponentType } from 'react';
import dynamic from 'next/dynamic';
import ImageLoader from '@/components/common/loader/ImageLoader';
import { ZAMP_LOGO_LOADER_SVG } from '@/constants/icons';

const DynamicLoader = () => <ImageLoader imageSrc={ZAMP_LOGO_LOADER_SVG} width={140} height={140} />;

/**
 * Wraps a dynamic import with SSR disabled and a standard loading spinner.
 *
 * Usage:
 *   const PdfViewer = clientOnly(() => import('./viewers/PdfViewer'));
 *   const Editor = clientOnly(() => import('./Editor'), () => <MySkeleton />);
 */
export function clientOnly<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  loading?: () => React.JSX.Element | null,
): React.ComponentType<React.ComponentProps<T>> {
  return dynamic(importFn, { ssr: false, loading: loading ?? DynamicLoader });
}
