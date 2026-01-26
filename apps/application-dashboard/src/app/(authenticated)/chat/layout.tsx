'use client';

import type { FC, ReactNode } from 'react';
import { notFound } from 'next/navigation';
import ImageLoader from '@/components/common/loader/ImageLoader';
import { ZAMP_LOGO_LOADER_SVG } from '@/constants/icons';
import { useIsPaceChatEnabled } from '@/hooks/useIsPaceChatEnabled';
import PaceLayoutContent from '@/modules/pace/components/layout/PaceLayoutContent';
import { PaceProvider } from '@/modules/pace/pace.context';

interface PaceLayoutProps {
  children: ReactNode;
}

const PaceLayout: FC<PaceLayoutProps> = ({ children }) => {
  const { isPaceChatEnabled, isLoading } = useIsPaceChatEnabled();

  if (isLoading) {
    return <ImageLoader imageSrc={ZAMP_LOGO_LOADER_SVG} width={140} height={140} />;
  }

  if (!isLoading && !isPaceChatEnabled) {
    notFound();
  }

  return (
    <PaceProvider>
      <PaceLayoutContent>{children}</PaceLayoutContent>
    </PaceProvider>
  );
};

export default PaceLayout;
