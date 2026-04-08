'use client';

import { useCallback, useEffect, useState } from 'react';
import { useLazyGetBrowserStreamingNovncQuery } from '@zamp-platform/chat';
import { Button } from '@zamp-platform/ui';
import { coerceIframeSrcForSecurePage } from 'modules/pace/components/browser-viewer/browserViewer.utils';
import ImageLoader from '@/components/common/loader/ImageLoader';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import EmptyState from '@/components/EmptyState';
import { DONE_EMPTY_STATE, ZAMP_LOGO_LOADER_SVG } from '@/constants/icons';
import TabWrapper from '@/modules/pace/components/dynamic-tabs/TabWrapper';
import { useDynamicTabs } from '@/modules/pace/components/dynamic-tabs/useDynamicTabs';
import { TAB_TYPE } from '@/modules/pace/pace.types';

type BrowserViewerDisplayState = 'waiting' | 'error';

const BROWSER_VIEWER_STATE_CONFIG: Record<
  BrowserViewerDisplayState,
  { title: string; description?: string; imageSrc: string; imageAlt: string; showRetry?: boolean }
> = {
  waiting: {
    title: 'Waiting for browser stream...',
    imageSrc: DONE_EMPTY_STATE,
    imageAlt: 'Waiting for stream',
  },
  error: {
    title: 'Failed to connect to browser stream',
    imageSrc: DONE_EMPTY_STATE,
    imageAlt: 'Connection error',
    showRetry: true,
  },
};

interface BrowserViewerTabProps {
  conversationId: string;
  sessionId?: string;
  isActive: boolean;
}

const BrowserViewerTab = ({ conversationId, sessionId, isActive }: BrowserViewerTabProps) => {
  const [iframeSrc, setIframeSrc] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);
  const [isStreamLoading, setIsStreamLoading] = useState(true);

  const [fetchNovnc, { isFetching }] = useLazyGetBrowserStreamingNovncQuery();

  const fetchStream = useCallback(async () => {
    if (!conversationId) return;

    try {
      setHasError(false);
      const res = await fetchNovnc({
        conversationId,
        sessionId: sessionId || '',
      }).unwrap();
      const direct = res?.novnc_url ?? null;
      const rawEmbedded = (res?.proxy_iframe_url?.trim() || direct) ?? null;
      const embedded = rawEmbedded ? coerceIframeSrcForSecurePage(rawEmbedded) : null;

      setIframeSrc(embedded);
    } catch {
      setHasError(true);
      setIframeSrc(null);
    }
  }, [conversationId, sessionId, fetchNovnc]);

  useEffect(() => {
    if (isActive) {
      fetchStream();
    }
  }, [isActive, fetchStream]);

  const renderPlaceholder = (state: BrowserViewerDisplayState) => {
    const config = BROWSER_VIEWER_STATE_CONFIG[state];

    return (
      <EmptyState
        imageSrc={config.imageSrc}
        imageAlt={config.imageAlt}
        title={config.title}
        description={config.description}
      >
        {config.showRetry && (
          <Button variant='link' size='small' onClick={fetchStream}>
            Retry
          </Button>
        )}
      </EmptyState>
    );
  };

  return (
    <CommonWrapper
      isLoading={isFetching}
      isError={hasError}
      skeletonType={SkeletonTypes.CUSTOM}
      loader={<ImageLoader imageSrc={ZAMP_LOGO_LOADER_SVG} width={140} height={140} />}
      className='flex h-full w-full items-center justify-center'
      renderError={renderPlaceholder('error')}
      disableAnimation
    >
      {iframeSrc ? (
        <div className='relative h-full w-full'>
          {isStreamLoading && (
            <div className='absolute inset-0 z-10 flex items-center justify-center bg-white'>
              <ImageLoader imageSrc={ZAMP_LOGO_LOADER_SVG} width={140} height={140} />
            </div>
          )}
          <iframe
            src={iframeSrc}
            className='h-full w-full'
            title='Browser live view'
            referrerPolicy='no-referrer-when-downgrade'
            onLoad={() => setIsStreamLoading(false)}
          />
        </div>
      ) : (
        renderPlaceholder('waiting')
      )}
    </CommonWrapper>
  );
};

const BrowserTabsContainer = () => {
  const { tabs, activeTab, isHydrated } = useDynamicTabs({ type: TAB_TYPE.BROWSER });

  if (!isHydrated || !tabs?.length) {
    return <ImageLoader imageSrc={ZAMP_LOGO_LOADER_SVG} width={140} height={140} />;
  }

  return (
    <div className='relative h-full w-full'>
      {tabs.map((tab) => {
        const isActive = activeTab?.stableKey === tab.stableKey;

        return (
          <TabWrapper key={tab.stableKey} isActive={isActive}>
            <BrowserViewerTab
              conversationId={tab.id}
              sessionId={tab.metadata?.sessionId as string | undefined}
              isActive={isActive}
            />
          </TabWrapper>
        );
      })}
    </div>
  );
};

export default BrowserTabsContainer;
