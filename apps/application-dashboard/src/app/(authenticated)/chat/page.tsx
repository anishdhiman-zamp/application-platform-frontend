'use client';

import FileTabsContainer from 'modules/pace/components/file-viewer/FileTabsContainer';
import { useSyncedUrlParam } from '@/modules/pace/hooks/useSyncedSearchParam';

const ChatPage = () => {
  const filePath = useSyncedUrlParam('f');

  if (filePath) {
    return <FileTabsContainer />;
  }

  return null;
};

export default ChatPage;
