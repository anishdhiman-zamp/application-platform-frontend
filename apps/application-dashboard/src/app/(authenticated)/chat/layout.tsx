'use client';

import type { FC, ReactNode } from 'react';
import ImageLoader from '@/components/common/loader/ImageLoader';
import { ZAMP_LOGO_LOADER_SVG } from '@/constants/icons';
import PaceLayoutContent from '@/modules/pace/components/layout/PaceLayoutContent';
import { FileViewerProvider } from '@/modules/pace/context/FileViewerContext';
import useDataPrefetch from '@/modules/pace/hooks/useDataPrefetch';
import { useFilesystemStatus } from '@/modules/pace/hooks/useFilesystemStatus';
import { PaceProvider } from '@/modules/pace/pace.context';

interface PaceLayoutProps {
  children: ReactNode;
}

const PaceLayout: FC<PaceLayoutProps> = ({ children }) => {
  // const { isPaceChatEnabled, isLoading } = useIsPaceChatEnabled();

  useDataPrefetch();

  const { isFilesystemActive, isFilesystemStatusLoading, isFilesystemError } = useFilesystemStatus();

  if (isFilesystemStatusLoading || isFilesystemError || !isFilesystemActive) {
    return <ImageLoader imageSrc={ZAMP_LOGO_LOADER_SVG} width={140} height={140} />;
  }

  // if (!isLoading) {
  //   return <NotFound />;
  // }

  return (
    <PaceProvider>
      <FileViewerProvider>
        <PaceLayoutContent>{children}</PaceLayoutContent>
      </FileViewerProvider>
    </PaceProvider>
  );
};

export default PaceLayout;
