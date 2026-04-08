'use client';

import { useCallback, useEffect, useState } from 'react';
import { useLazyGetBrowserLiveViewNovncQuery } from '@zamp-platform/chat';
import { Button } from '@zamp-platform/ui';
import { Globe } from 'lucide-react';
import {
  coerceIframeSrcForSecurePage,
  expectedChromeSessionIdForConversation,
} from 'modules/pace/components/browser-viewer/browserViewer.utils';
import ImageLoader from '@/components/common/loader/ImageLoader';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import { ZAMP_LOGO_LOADER_SVG } from '@/constants/icons';
import TabWrapper from '@/modules/pace/components/dynamic-tabs/TabWrapper';
import { useDynamicTabs } from '@/modules/pace/components/dynamic-tabs/useDynamicTabs';
import { TAB_TYPE } from '@/modules/pace/pace.types';

interface BrowserViewerTabProps {
  conversationId: string;
  isActive: boolean;
}

const BrowserViewerTab = ({ conversationId, isActive }: BrowserViewerTabProps) => {
  const [iframeSrc, setIframeSrc] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [isStreamLoading, setIsStreamLoading] = useState(true);

  const [fetchNovnc, { isFetching }] = useLazyGetBrowserLiveViewNovncQuery();

  const fetchStream = useCallback(async () => {
    if (!conversationId) return;

    try {
      setHasError(false);
      const res = await fetchNovnc({
        conversationId,
        sessionId: expectedChromeSessionIdForConversation(conversationId),
      }).unwrap();
      const direct = res?.novnc_url ?? null;
      const rawEmbedded = (res?.proxy_iframe_url?.trim() || direct) ?? null;
      const embedded = rawEmbedded ? coerceIframeSrcForSecurePage(rawEmbedded) : null;

      setIframeSrc(embedded);
      setHasFetched(true);
    } catch {
      setHasError(true);
      setIframeSrc(null);
    }
  }, [conversationId, fetchNovnc]);

  useEffect(() => {
    if (isActive) {
      fetchStream();
    }
  }, [isActive, fetchStream]);

  return (
    <CommonWrapper
      isLoading={isFetching}
      isError={hasError}
      skeletonType={SkeletonTypes.CUSTOM}
      loader={<ImageLoader imageSrc={ZAMP_LOGO_LOADER_SVG} width={140} height={140} />}
      className='flex h-full w-full items-center justify-center'
      renderError={
        <div className='flex h-full w-full items-center justify-center'>
          <div className='text-center'>
            <div className='bg-GRAY_100 mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full'>
              <Globe size={20} className='text-GRAY_700' />
            </div>
            <p className='f-13-450 text-GRAY_700'>Failed to connect to browser stream</p>
            <Button variant='link' size='small' onClick={fetchStream} className='mt-2'>
              Retry
            </Button>
          </div>
        </div>
      }
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
        <div className='flex h-full w-full items-center justify-center'>
          <div className='text-center'>
            <div className='bg-GRAY_100 mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full'>
              <Globe size={20} className='text-GRAY_700' />
            </div>
            <p className='f-13-450 text-GRAY_700'>
              {hasFetched ? 'Live stream has ended' : 'Waiting for browser stream...'}
            </p>
          </div>
        </div>
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
            <BrowserViewerTab conversationId={tab.id} isActive={isActive} />
          </TabWrapper>
        );
      })}
    </div>
  );
};

export default BrowserTabsContainer;
