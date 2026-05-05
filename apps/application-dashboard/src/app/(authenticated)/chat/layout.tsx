'use client';

import type { FC, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import NotFound from '@/app/not-found';
import ImageLoader from '@/components/common/loader/ImageLoader';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import { ZAMP_LOGO_LOADER_SVG } from '@/constants/icons';
import { useIsPaceChatEnabled } from '@/hooks/useIsPaceChatEnabled';
import PaceLayoutContent from '@/modules/pace/components/layout/PaceLayoutContent';
import useDataPrefetch from '@/modules/pace/hooks/useDataPrefetch';
import { useFilesystemStatus } from '@/modules/pace/hooks/useFilesystemStatus';

interface PaceLayoutProps {
  children: ReactNode;
}

const PaceLayout: FC<PaceLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const { isEnabled: isPaceChatEnabled, isLoading } = useIsPaceChatEnabled();
  const isFilesystemSurface =
    pathname === '/chat' || pathname?.startsWith('/chat/files') || pathname?.startsWith('/chat/dataset');
  const shouldPrepareFilesystem = isPaceChatEnabled && isFilesystemSurface;
  const {
    isFilesystemActive,
    isFilesystemStatusLoading,
    isFilesystemError,
    refetch: refetchStatus,
  } = useFilesystemStatus({ enabled: shouldPrepareFilesystem });

  useDataPrefetch({ enabled: pathname === '/chat' });

  const isFilesystemLoading =
    shouldPrepareFilesystem && (isFilesystemStatusLoading || (!isFilesystemActive && !isFilesystemError));
  const isPageLoading = isLoading || isFilesystemLoading;

  return (
    <CommonWrapper
      isLoading={isPageLoading}
      isError={isFilesystemError}
      refetchFunction={refetchStatus}
      skeletonType={SkeletonTypes.CUSTOM}
      loader={<ImageLoader imageSrc={ZAMP_LOGO_LOADER_SVG} width={140} height={140} />}
      className='h-full'
      disableAnimation
    >
      {!isPaceChatEnabled ? <NotFound showOrgSwitcher /> : <PaceLayoutContent>{children}</PaceLayoutContent>}
    </CommonWrapper>
  );
};

export default PaceLayout;
