'use client';

import { useCallback } from 'react';
import { Button } from '@zamp-platform/ui';
import { ArrowLeft } from 'lucide-react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ROUTES_PATH } from '@/constants/routeConfig';
import AgentDetailPage from '@/modules/pace/components/agents/components/AgentDetailPage';
import { useDynamicTabs } from '@/modules/pace/components/dynamic-tabs/useDynamicTabs';
import { TAB_TYPE } from '@/modules/pace/pace.types';

const ChatAgentPage = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const agentId = (params?.agentId as string) ?? '';

  const { getTabById } = useDynamicTabs({ type: TAB_TYPE.AGENT });
  const storedTab = getTabById(agentId);
  const agentName = storedTab?.name ?? searchParams?.get('title') ?? '';
  const agentDescription = (storedTab?.metadata?.description as string) ?? searchParams?.get('description') ?? '';
  const avatarKey = (storedTab?.metadata?.avatarKey as string) ?? searchParams?.get('avatarKey') ?? '';

  const handleBack = useCallback(() => {
    router.push(ROUTES_PATH.CHAT_AGENTS);
  }, [router]);

  if (!agentId) return null;

  return (
    <div className='flex h-full flex-col overflow-hidden'>
      <div className='flex shrink-0 items-center gap-x-1 px-3 pt-2'>
        <Button
          variant='ghost'
          onClick={handleBack}
          className='text-GRAY_700 hover:text-GRAY_900 hover:bg-accent f-13-500 h-8 gap-x-1.5 rounded-lg px-2'
          aria-label='Back to agents'
        >
          <ArrowLeft size={16} />
          Back to agents
        </Button>
      </div>
      <div className='min-h-0 flex-1'>
        <AgentDetailPage
          key={agentId}
          agentId={agentId}
          agentName={agentName}
          agentDescription={agentDescription}
          avatarKey={avatarKey}
        />
      </div>
    </div>
  );
};

export default ChatAgentPage;
