'use client';

import type { FC, ReactNode } from 'react';
import NotFound from '@/app/not-found';
import ImageLoader from '@/components/common/loader/ImageLoader';
import { ZAMP_LOGO_LOADER_SVG } from '@/constants/icons';
import { useIsMacsFileSystemEnabled } from '@/hooks/useIsMacsFileSystemEnabled';
import { useFilesystemStatus } from '@/modules/pace/hooks/useFilesystemStatus';

interface FilesLayoutProps {
  children: ReactNode;
}

const FilesLayout: FC<FilesLayoutProps> = ({ children }) => {
  const { isMacsFileSystemEnabled, isLoading } = useIsMacsFileSystemEnabled();
  const { isFilesystemActive, isFilesystemStatusLoading, isFilesystemError } = useFilesystemStatus();

  if (isLoading || isFilesystemStatusLoading || isFilesystemError || !isFilesystemActive) {
    return <ImageLoader imageSrc={ZAMP_LOGO_LOADER_SVG} width={140} height={140} />;
  }

  if (!isMacsFileSystemEnabled) {
    return <NotFound />;
  }

  return <>{children}</>;
};

export default FilesLayout;
