import { useCallback, useEffect, useRef, useState } from 'react';
import { useGetAgentQuery } from '@/apis/agents';
import type { AgentType } from '@/modules/pace/components/agents/types/agents.types';

const MAX_POLL_ATTEMPTS = 20;
const POLL_INTERVAL_MS = 5000;

interface UseAgentWithPollingResult {
  data: AgentType | undefined;
  isLoading: boolean;
  isError: boolean;
  isPolling: boolean;
}

export const useAgentWithPolling = (agentId: string): UseAgentWithPollingResult => {
  const hasEverSucceededRef = useRef(false);
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [pollCount, setPollCount] = useState(0);
  const [isPolling, setIsPolling] = useState(false);

  const { data, isLoading, isError, refetch } = useGetAgentQuery({ agentId });

  const effectiveIsLoading = isLoading || isPolling;
  const effectiveIsError = isError && !isPolling && pollCount >= MAX_POLL_ATTEMPTS;

  const clearPollTimer = useCallback(() => {
    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (data && !hasEverSucceededRef.current) {
      hasEverSucceededRef.current = true;
      setIsPolling(false);
      clearPollTimer();
    }
  }, [data, clearPollTimer]);

  useEffect(() => {
    if (hasEverSucceededRef.current) return;
    if (isLoading) return;

    if (isError && pollCount < MAX_POLL_ATTEMPTS) {
      setIsPolling(true);
      clearPollTimer();
      pollTimerRef.current = setTimeout(() => {
        setPollCount((prev) => prev + 1);
        refetch();
      }, POLL_INTERVAL_MS);
    } else if (isError && pollCount >= MAX_POLL_ATTEMPTS) {
      setIsPolling(false);
    }
  }, [isError, isLoading, pollCount, refetch, clearPollTimer]);

  useEffect(() => {
    return clearPollTimer;
  }, [clearPollTimer]);

  useEffect(() => {
    hasEverSucceededRef.current = false;
    setPollCount(0);
    setIsPolling(false);
    clearPollTimer();
  }, [agentId, clearPollTimer]);

  return {
    data,
    isLoading: effectiveIsLoading,
    isError: effectiveIsError,
    isPolling,
  };
};
