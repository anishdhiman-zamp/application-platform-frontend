'use client';

import FileTabsContainer from 'modules/pace/components/file-viewer/FileTabsContainer';
import { useSyncedUrlParam } from '@/modules/pace/hooks/useSyncedSearchParam';

const ChatPage = () => {
  const filePath = useSyncedUrlParam('f');

  console.log('filePath', filePath);

  if (filePath) {
    return <FileTabsContainer />;
  }

  return null;
};

export default ChatPage;
