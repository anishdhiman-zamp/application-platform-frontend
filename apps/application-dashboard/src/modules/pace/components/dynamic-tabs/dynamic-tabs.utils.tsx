import { type ReactNode } from 'react';
import { FileIcon } from '@zamp-platform/ui';
import { Activity, Database, Globe } from 'lucide-react';
import AgentTabIcon from '@/modules/pace/components/agents/components/AgentTabIcon';
import { getFileExtension } from '@/modules/pace/components/files/file-tree.utils';
import { DynamicTab, DynamicTabType, TAB_TYPE } from '@/modules/pace/pace.types';

export const getDefaultIcon = (tab: DynamicTab): ReactNode => {
  const tabType: DynamicTabType = tab.type ?? TAB_TYPE.FILE;

  switch (tabType) {
    case TAB_TYPE.FILE: {
      const fileExtension = getFileExtension(tab.name);

      return <FileIcon extension={fileExtension || 'txt'} className='size-5 rounded-sm' iconClassName='size-4' />;
    }
    case TAB_TYPE.TASK:
      return <Activity size={14} className='shrink-0' />;
    case TAB_TYPE.AGENT:
      return <AgentTabIcon />;
    case TAB_TYPE.BROWSER:
      return <Globe size={14} className='shrink-0' />;
    case TAB_TYPE.DATASET:
      return <Database size={14} className='shrink-0' />;
    default:
      return <FileIcon extension='txt' className='size-5 rounded-sm' iconClassName='size-4' />;
  }
};
