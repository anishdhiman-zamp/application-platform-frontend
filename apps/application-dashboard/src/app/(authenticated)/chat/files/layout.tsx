'use client';

import type { FC, ReactNode } from 'react';
import ImageLoader from '@/components/common/loader/ImageLoader';
import { ZAMP_LOGO_LOADER_SVG } from '@/constants/icons';
import { useFilesystemStatus } from '@/modules/pace/hooks/useFilesystemStatus';

interface FilesLayoutProps {
  children: ReactNode;
}

const FilesLayout: FC<FilesLayoutProps> = ({ children }) => {
  const { isFilesystemActive, isFilesystemStatusLoading, isFilesystemError } = useFilesystemStatus();

  if (isFilesystemStatusLoading || isFilesystemError || !isFilesystemActive) {
    return <ImageLoader imageSrc={ZAMP_LOGO_LOADER_SVG} width={140} height={140} />;
  }

  return <>{children}</>;
};

export default FilesLayout;
