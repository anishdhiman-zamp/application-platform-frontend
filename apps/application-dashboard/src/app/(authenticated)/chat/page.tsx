'use client';

import BrowserTabsContainer from 'modules/pace/components/browser-viewer/BrowserTabsContainer';
import { useAppSelector } from '@/hooks/toolkit';
import ChatHomePage from '@/modules/pace/components/chat/ChatHomePage';
import { TAB_TYPE } from '@/modules/pace/pace.types';
import { selectActiveTab } from '@/store/slices/dynamic-tabs.slice';

const ChatPage = () => {
  const activeTab = useAppSelector(selectActiveTab);

  if (activeTab?.type === TAB_TYPE.BROWSER) {
    return <BrowserTabsContainer />;
  }

  if (activeTab && activeTab.type !== TAB_TYPE.FILE) {
    return null;
  }

  return <ChatHomePage />;
};

export default ChatPage;
