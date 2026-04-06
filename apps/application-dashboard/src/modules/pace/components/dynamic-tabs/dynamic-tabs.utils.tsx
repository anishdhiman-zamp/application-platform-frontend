import { type ReactNode } from 'react';
import { FileIcon } from '@zamp-platform/ui';
import { Globe, Route } from 'lucide-react';
import AgentTabIcon from '@/modules/pace/components/agents/components/AgentTabIcon';
import { getAgentAvatar, getAgentAvatarByKey } from '@/modules/pace/components/agents/constants/agents.constants';
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
      return <Route size={14} className='shrink-0' />;
    case TAB_TYPE.AGENT: {
      const storedKey = tab.metadata?.avatarKey as string | undefined;
      const avatar = (storedKey && getAgentAvatarByKey(storedKey)) || getAgentAvatar(tab.name);

      return <AgentTabIcon avatar={avatar} />;
    }
    case TAB_TYPE.BROWSER:
      return <Globe size={14} className='shrink-0' />;
    default:
      return <FileIcon extension='txt' className='size-5 rounded-sm' iconClassName='size-4' />;
  }
};
