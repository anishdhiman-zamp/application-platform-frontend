'use client';

import { useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@zamp-platform/ui';
import { X } from 'lucide-react';
import { getAgentAvatar, getAgentAvatarByKey } from 'modules/pace/components/agents/constants/agents.constants';
import ImageKitImage from '@/components/ImageKitImage';
import { useDynamicTabs } from '@/modules/pace/components/dynamic-tabs/useDynamicTabs';
import { useFilesPanelHeaderSlot } from '@/modules/pace/components/files-panel/FilesPanelHeaderSlot';
import { TAB_TYPE } from '@/modules/pace/pace.types';

interface AgentPanelHeaderProps {
  isActive: boolean;
  agentName: string;
  avatarKey?: string;
}

const AgentPanelHeader = ({ isActive, agentName, avatarKey }: AgentPanelHeaderProps) => {
  const headerSlot = useFilesPanelHeaderSlot();
  const { closeAllTabs } = useDynamicTabs({ type: TAB_TYPE.AGENT });
  const avatar = (avatarKey && getAgentAvatarByKey(avatarKey)) || getAgentAvatar(agentName || '');

  const handleClose = useCallback(() => {
    closeAllTabs();
  }, [closeAllTabs]);

  if (!isActive || !headerSlot) return null;

  return createPortal(
    <div className='border-GRAY_300 bg-BG_WHITE flex h-[54px] shrink-0 items-center justify-between gap-4 border-b px-4'>
      <div className='flex min-w-0 flex-1 items-center gap-2.5'>
        <div className='flex size-5 shrink-0 items-center justify-center'>
          <ImageKitImage
            src={avatar.src}
            alt={avatar.alt}
            width={20}
            height={20}
            className='size-full object-contain'
          />
        </div>
        <span className='text-GRAY_1000 f-14-500 block min-w-0 truncate'>{agentName || 'Agent'}</span>
      </div>
      <Button
        type='button'
        variant='ghost'
        size='icon'
        onClick={handleClose}
        aria-label='Close agent panel'
        className='text-GRAY_1000 hover:bg-GRAY_100 size-8 shrink-0 rounded-md'
      >
        <X size={16} />
      </Button>
    </div>,
    headerSlot,
  );
};

export default AgentPanelHeader;
