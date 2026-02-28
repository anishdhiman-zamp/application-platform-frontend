import { type ReactNode } from 'react';
import { FileIcon } from '@zamp-platform/ui';
import { Zap } from 'lucide-react';
import { getFileExtension } from '@/modules/pace/components/files/file-tree.utils';
import { DynamicTab, DynamicTabType, TAB_TYPE } from '@/modules/pace/pace.types';

export const getDefaultIcon = (tab: DynamicTab): ReactNode => {
  const tabType: DynamicTabType = tab.type ?? TAB_TYPE.FILE;

  switch (tabType) {
    case TAB_TYPE.FILE: {
      const fileExtension = getFileExtension(tab.name);

      return <FileIcon extension={fileExtension || 'txt'} size='xs' />;
    }
    case TAB_TYPE.TASK:
      return <Zap size={14} className='text-GRAY_700 shrink-0' />;
    default:
      return <FileIcon extension='txt' size='xs' />;
  }
};
