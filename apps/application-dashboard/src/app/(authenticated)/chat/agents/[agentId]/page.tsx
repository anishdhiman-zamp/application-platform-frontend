'use client';

import { useParams, useSearchParams } from 'next/navigation';
import AgentDetailPage from '@/modules/pace/components/agents/components/AgentDetailPage';
import { useDynamicTabs } from '@/modules/pace/components/dynamic-tabs/useDynamicTabs';
import { TAB_TYPE } from '@/modules/pace/pace.types';

const ChatAgentPage = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const urlAgentId = (params?.agentId as string) ?? '';

  const { activeTab, getTabById } = useDynamicTabs({ type: TAB_TYPE.AGENT });

  const agentId = activeTab?.id ?? urlAgentId;
  const storedTab = activeTab ?? getTabById(agentId);
  const agentName = storedTab?.name ?? searchParams?.get('title') ?? '';
  const agentDescription = (storedTab?.metadata?.description as string) ?? searchParams?.get('description') ?? '';
  const avatarKey = (storedTab?.metadata?.avatarKey as string) ?? '';

  if (!agentId) return null;

  return (
    <AgentDetailPage
      key={agentId}
      agentId={agentId}
      agentName={agentName}
      agentDescription={agentDescription}
      avatarKey={avatarKey}
    />
  );
};

export default ChatAgentPage;
