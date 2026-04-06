'use client';

import BrowserTabsContainer from 'modules/pace/components/browser-viewer/BrowserTabsContainer';
import FileTabsContainer from 'modules/pace/components/file-viewer/FileTabsContainer';
import { useAppSelector } from '@/hooks/toolkit';
import ChatHomePage from '@/modules/pace/components/chat/ChatHomePage';
import { TAB_TYPE } from '@/modules/pace/pace.types';
import { selectActiveTab } from '@/store/slices/dynamic-tabs.slice';

const ChatPage = () => {
  const activeTab = useAppSelector(selectActiveTab);
  const tabType = activeTab?.type ?? TAB_TYPE.FILE;

  if (activeTab && tabType === TAB_TYPE.FILE) {
    return <FileTabsContainer />;
  }

  if (activeTab && tabType === TAB_TYPE.BROWSER) {
    return <BrowserTabsContainer />;
  }

  if (activeTab) {
    return null;
  }

  return <ChatHomePage />;
};

export default ChatPage;
