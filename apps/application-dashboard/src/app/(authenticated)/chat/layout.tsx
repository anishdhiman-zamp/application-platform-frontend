'use client';

import type { FC, ReactNode } from 'react';
import NotFound from '@/app/not-found';
import ImageLoader from '@/components/common/loader/ImageLoader';
import { FEATURE_FLAGS } from '@/constants/featureFlags';
import { ZAMP_LOGO_LOADER_SVG } from '@/constants/icons';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import PaceLayoutContent from '@/modules/pace/components/layout/PaceLayoutContent';
import { FileViewerProvider } from '@/modules/pace/context/FileViewerContext';
import useDataPrefetch from '@/modules/pace/hooks/useDataPrefetch';
import { PaceProvider } from '@/modules/pace/pace.context';

interface PaceLayoutProps {
  children: ReactNode;
}

const PaceLayout: FC<PaceLayoutProps> = ({ children }) => {
  const { isEnabled: isPaceChatEnabled, isLoading } = useFeatureFlag(FEATURE_FLAGS.ZAMP_INTERNAL);

  useDataPrefetch();

  if (isLoading) {
    return <ImageLoader imageSrc={ZAMP_LOGO_LOADER_SVG} width={140} height={140} />;
  }

  if (!isPaceChatEnabled) {
    return <NotFound />;
  }

  return (
    <PaceProvider>
      <FileViewerProvider>
        <PaceLayoutContent>{children}</PaceLayoutContent>
      </FileViewerProvider>
    </PaceProvider>
  );
};

export default PaceLayout;
