'use client';

import FileTabsContainer from 'modules/pace/components/file-viewer/FileTabsContainer';
import ChatHomePage from '@/modules/pace/components/chat/ChatHomePage';
import { useSyncedUrlParam } from '@/modules/pace/hooks/useSyncedSearchParam';

const ChatPage = () => {
  const filePath = useSyncedUrlParam('f');

  if (filePath) {
    return <FileTabsContainer />;
  }

  return <ChatHomePage />;
};

export default ChatPage;
