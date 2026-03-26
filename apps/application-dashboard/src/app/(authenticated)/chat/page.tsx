'use client';

import BrowserTabsContainer from 'modules/pace/components/browser-viewer/BrowserTabsContainer';
import FileTabsContainer from 'modules/pace/components/file-viewer/FileTabsContainer';
import { useSyncedUrlParam } from '@/modules/pace/hooks/useSyncedSearchParam';

const ChatPage = () => {
  const filePath = useSyncedUrlParam('f');
  const browserConversationId = useSyncedUrlParam('b');

  if (browserConversationId) {
    return <BrowserTabsContainer />;
  }

  if (filePath) {
    return <FileTabsContainer />;
  }

  return null;
};

export default ChatPage;
