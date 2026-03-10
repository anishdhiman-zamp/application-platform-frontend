'use client';

import type { FC, ReactNode } from 'react';
import ImageLoader from '@/components/common/loader/ImageLoader';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import { ZAMP_LOGO_LOADER_SVG } from '@/constants/icons';
import { useFilesystemStatus } from '@/modules/pace/hooks/useFilesystemStatus';

interface FilesLayoutProps {
  children: ReactNode;
}

const FilesLayout: FC<FilesLayoutProps> = ({ children }) => {
  const { isFilesystemActive, isFilesystemStatusLoading, isFilesystemError, refetch } = useFilesystemStatus();

  return (
    <CommonWrapper
      isLoading={isFilesystemStatusLoading || (!isFilesystemActive && !isFilesystemError)}
      isError={isFilesystemError}
      refetchFunction={refetch}
      skeletonType={SkeletonTypes.CUSTOM}
      loader={<ImageLoader imageSrc={ZAMP_LOGO_LOADER_SVG} width={140} height={140} />}
      className='flex h-full w-full items-center justify-center'
    >
      {children}
    </CommonWrapper>
  );
};

export default FilesLayout;
