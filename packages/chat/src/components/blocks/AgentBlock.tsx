'use client';

import { Button } from '@zamp-platform/ui';
import React, { useState } from 'react';

import { KEYBOARD_KEYS } from '@/constants/shortcuts';

import { useChatActions } from '../../context/ChatActionsContext';
import type { AgentBlockType, AgentContentBlock } from '../../types/block.types';

const AGENT_AVATAR_COUNT = 11;

const getAgentAvatarSrc = (avatarKey: string | undefined, name: string): string => {
  if (avatarKey) {
    const num = avatarKey.replace('agent_', '');

    return `/images/agents/agent_icon_${num}.png`;
  }

  const index = (name.length % AGENT_AVATAR_COUNT) + 1;

  return `/images/agents/agent_icon_${index}.png`;
};

interface AgentBlockProps {
  payload: AgentBlockType['payload'] | AgentContentBlock['payload'];
}

const AgentBlock: React.FC<AgentBlockProps> = ({ payload }) => {
  const { agent_id, name, description } = payload;
  const avatar = 'avatar' in payload ? payload.avatar : undefined;
  const { onAgentClick, onAgentTest } = useChatActions();
  const avatarSrc = getAgentAvatarSrc(avatar, name);
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className='border-GRAY_400 bg-BG_GRAY_2 flex w-full items-center justify-between rounded-lg border p-2.5'
      onClick={() => onAgentClick?.(agent_id, name, description, avatar)}
      onKeyDown={(e) => {
        if (onAgentClick && (e.key === KEYBOARD_KEYS.ENTER || e.key === KEYBOARD_KEYS.SPACE)) {
          e.preventDefault();
          onAgentClick(agent_id, name, description, avatar);
        }
      }}
      role={onAgentClick ? 'button' : undefined}
      tabIndex={onAgentClick ? 0 : undefined}
      style={onAgentClick ? { cursor: 'pointer' } : undefined}
    >
      <div className='flex min-w-0 flex-1 items-center gap-2'>
        <div className='flex size-6 shrink-0 items-center justify-center'>
          {imgError ? (
            <div className='bg-GRAY_200 text-GRAY_700 f-12-550 flex size-full items-center justify-center rounded'>
              {name.charAt(0).toUpperCase()}
            </div>
          ) : (
            <img src={avatarSrc} alt={name} className='size-full object-contain' onError={() => setImgError(true)} />
          )}
        </div>
        <span className='f-13-500 text-GRAY_1000 truncate'>{name}</span>
      </div>

      <Button
        variant='outline'
        size='small'
        className='ml-2 h-7 shrink-0 rounded-lg px-3 text-xs'
        onClick={(e) => {
          e.stopPropagation();
          onAgentTest?.(agent_id, name);
        }}
      >
        Test
      </Button>
    </div>
  );
};

export default AgentBlock;
