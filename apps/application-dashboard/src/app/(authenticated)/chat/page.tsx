'use client';

import FileTabsContainer from 'modules/pace/components/file-viewer/FileTabsContainer';
import { useAppSelector } from '@/hooks/toolkit';
import ChatHomePage from '@/modules/pace/components/chat/ChatHomePage';
import { TAB_TYPE } from '@/modules/pace/pace.types';
import { selectActiveTab } from '@/store/slices/dynamic-tabs.slice';

const ChatPage = () => {
  const activeTab = useAppSelector(selectActiveTab);
  const isFileTab = activeTab && (activeTab.type ?? TAB_TYPE.FILE) === TAB_TYPE.FILE;
  const isNonFileTab = activeTab && !isFileTab;

  if (isFileTab) {
    return <FileTabsContainer />;
  }

  if (isNonFileTab) {
    return null;
  }

  return <ChatHomePage />;
};

export default ChatPage;
