'use client';

import { useAppSelector } from '@/hooks/toolkit';
import BrowserTabsContainer from '@/modules/pace/components/browser-viewer/BrowserTabsContainer';
import ChatHomePage from '@/modules/pace/components/chat/ChatHomePage';
import { TAB_TYPE } from '@/modules/pace/pace.types';
import { selectActiveTab } from '@/store/slices/dynamic-tabs.slice';

const ChatHomePane = () => {
  const activeTab = useAppSelector(selectActiveTab);

  if (activeTab?.type === TAB_TYPE.BROWSER) {
    return <BrowserTabsContainer />;
  }

  if (activeTab && activeTab.type !== TAB_TYPE.FILE && activeTab.type !== TAB_TYPE.AGENT) {
    return null;
  }

  return <ChatHomePage />;
};

export default ChatHomePane;
