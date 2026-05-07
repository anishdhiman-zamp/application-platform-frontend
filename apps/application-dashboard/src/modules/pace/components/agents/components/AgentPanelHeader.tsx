'use client';

import { useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Button, Skeleton } from '@zamp-platform/ui';
import { Bot } from 'lucide-react';
import ShareAgentPopup from 'modules/pace/components/agents/components/ShareAgentPopup';
import { useRouter } from 'next/navigation';
import { FEATURE_FLAGS } from '@/constants/featureFlags';
import { ROUTES_PATH } from '@/constants/routeConfig';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import ChatButtonZampLogo from '@/modules/pace/components/chat/ChatButtonZampLogo';
import { useFilesPanelHeaderSlot } from '@/modules/pace/components/files-panel/FilesPanelHeaderSlot';
import { setNewChatDraft } from '@/modules/pace/hooks/useChatDraftInput';

interface AgentPanelHeaderProps {
  isActive: boolean;
  agentId: string;
  agentName: string;
  isAgentNameLoading?: boolean;
  onClose: () => void;
  onAgentNameChange?: (value: string) => void;
}

const AgentPanelHeader = ({
  isActive,
  agentId,
  agentName,
  isAgentNameLoading = false,
  onClose,
  onAgentNameChange,
}: AgentPanelHeaderProps) => {
  const headerSlot = useFilesPanelHeaderSlot();
  const router = useRouter();
  const { isEnabled: isAgentsFe } = useFeatureFlag(FEATURE_FLAGS.AGENTS_FE);
  const displayName = agentName || 'Agent';

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleChatWithAgent = useCallback(() => {
    setNewChatDraft(`I want to collaborate with ${displayName} `);
    router.push(ROUTES_PATH.CHAT);
  }, [displayName, router]);

  const header = (
    <div className='border-GRAY_300 bg-BG_WHITE flex h-[54px] shrink-0 items-center justify-between gap-4 border-b px-4'>
      <div className='flex min-w-0 flex-1 items-center gap-2'>
        <div className='text-GRAY_700 flex size-5 shrink-0 items-center justify-center'>
          <Bot size={16} />
        </div>
        <div className='flex min-w-0 items-center gap-1'>
          {isAgentNameLoading ? (
            <Skeleton className='h-8 w-60' />
          ) : (
            <span className='grid max-w-full min-w-0 shrink grid-cols-[minmax(0,max-content)]'>
              <span
                aria-hidden
                className='f-14-550 text-GRAY_1000 invisible col-start-1 row-start-1 min-w-0 truncate whitespace-pre'
              >
                {displayName}
              </span>
              <input
                value={agentName}
                onChange={(event) => onAgentNameChange?.(event.target.value)}
                readOnly={!onAgentNameChange}
                aria-label='Agent name'
                size={1}
                className='f-14-550 text-GRAY_1000 placeholder:text-GRAY_500 col-start-1 row-start-1 w-full min-w-0 truncate border-none bg-transparent outline-none'
                placeholder='Agent name'
              />
            </span>
          )}
          {isAgentsFe && <ShareAgentPopup agentId={agentId} iconOnly />}
        </div>
      </div>
      <div className='flex shrink-0 items-center gap-2'>
        <Button variant='default' size='small' leadingIcon={<ChatButtonZampLogo />} onClick={handleChatWithAgent}>
          Chat with Agent
        </Button>
        <Button type='button' variant='secondary' size='small' onClick={handleClose}>
          Close
        </Button>
      </div>
    </div>
  );

  if (!isActive) return null;

  return headerSlot ? createPortal(header, headerSlot) : header;
};

export default AgentPanelHeader;
