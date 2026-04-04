'use client';

import { memo, useCallback, useEffect, useState } from 'react';
import { useLazyGetBrowserLiveViewNovncQuery } from '@zamp-platform/chat';
import { cn } from '@zamp-platform/ui/utils';
import { Globe } from 'lucide-react';
import ImageLoader from '@/components/common/loader/ImageLoader';
import { ZAMP_LOGO_LOADER_SVG } from '@/constants/icons';
import { useDynamicTabs } from '@/modules/pace/components/dynamic-tabs/useDynamicTabs';
import { TAB_TYPE } from '@/modules/pace/pace.types';

const A2A_TASK_CONVERSATION_ID_PREFIX = 'a2a-task-';

function expectedChromeSessionIdForConversation(conversationId: string): string {
  const pathKey = conversationId.startsWith(A2A_TASK_CONVERSATION_ID_PREFIX)
    ? conversationId.slice(A2A_TASK_CONVERSATION_ID_PREFIX.length)
    : conversationId;

  return `chrome-${pathKey}`;
}

function coerceIframeSrcForSecurePage(url: string): string {
  if (typeof window === 'undefined' || window.location.protocol !== 'https:') {
    return url;
  }
  if (url.startsWith('http://')) {
    return `https://${url.slice('http://'.length)}`;
  }

  return url;
}

interface BrowserViewerTabProps {
  conversationId: string;
  isActive: boolean;
}

const BrowserViewerTab = ({ conversationId, isActive }: BrowserViewerTabProps) => {
  const [fetchNovnc, { isFetching }] = useLazyGetBrowserLiveViewNovncQuery();
  const [iframeSrc, setIframeSrc] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);

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

  if (isFetching) {
    return (
      <div className='flex h-full w-full items-center justify-center'>
        <ImageLoader imageSrc={ZAMP_LOGO_LOADER_SVG} width={140} height={140} />
      </div>
    );
  }

  if (hasError) {
    return (
      <div className='flex h-full w-full items-center justify-center'>
        <div className='text-center'>
          <div className='bg-GRAY_100 mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full'>
            <Globe size={20} className='text-GRAY_700' />
          </div>
          <p className='f-13-450 text-GRAY_700'>Failed to connect to browser stream</p>
          <button onClick={fetchStream} className='f-13-500 text-BLUE_700 mt-2 hover:underline'>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (iframeSrc) {
    return (
      <iframe
        src={iframeSrc}
        className='h-full w-full bg-white'
        title='Browser live view'
        referrerPolicy='no-referrer-when-downgrade'
      />
    );
  }

  return (
    <div className='flex h-full w-full items-center justify-center'>
      <div className='text-center'>
        <div className='bg-GRAY_100 mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full'>
          <Globe size={20} className='text-GRAY_700' />
        </div>
        <p className='f-13-450 text-GRAY_700'>Waiting for browser stream...</p>
      </div>
    </div>
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

const TabWrapper = memo(({ isActive, children }: { isActive: boolean; children: React.ReactNode }) => (
  <div
    className={cn(
      'absolute inset-0',
      isActive ? 'pointer-events-auto visible z-1' : 'pointer-events-none invisible z-0',
    )}
  >
    {children}
  </div>
));

TabWrapper.displayName = 'TabWrapper';

export default BrowserTabsContainer;
