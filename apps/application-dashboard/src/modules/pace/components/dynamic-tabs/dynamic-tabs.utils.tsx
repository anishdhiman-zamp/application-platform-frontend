import { type ReactNode } from 'react';
import { FileIcon } from '@zamp-platform/ui';
import { Zap } from 'lucide-react';
import { getFileExtension } from '@/modules/pace/components/files/file-tree.utils';
import { DynamicTab, DynamicTabType } from '@/modules/pace/pace.types';

export const getDefaultIcon = (tab: DynamicTab): ReactNode => {
  const tabType: DynamicTabType = tab.type ?? 'file';

  switch (tabType) {
    case 'file': {
      const fileExtension = getFileExtension(tab.name);

      return <FileIcon extension={fileExtension || 'txt'} size='xs' />;
    }
    case 'task':
      return <Zap size={14} className='text-GRAY_700 shrink-0' />;
    default:
      return <FileIcon extension='txt' size='xs' />;
  }
};
