'use client';

import { useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ROUTES_PATH } from '@/constants/routeConfig';
import { TAB_QUERY_PARAM } from '@/modules/pace/pace.types';

const ChatAgentRedirectPage = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const agentId = (params?.agentId as string) ?? '';

  useEffect(() => {
    if (!agentId) return;

    const nextParams = new URLSearchParams(searchParams?.toString());

    nextParams.set(TAB_QUERY_PARAM.AGENT, agentId);
    router.replace(`${ROUTES_PATH.CHAT_AGENTS}?${nextParams.toString()}`);
  }, [agentId, router, searchParams]);

  return null;
};

export default ChatAgentRedirectPage;
