import { useCallback, useEffect } from 'react';
import { API_DOMAIN } from '@zamp-platform/api';
import { useSSE } from '@zamp-platform/utils';
import { API_ENDPOINTS } from '@/apis/apiEndpoint.constants';
import {
  useLazyGetActivityArtifactsQuery,
  useLazyGetActivityLogsQuery,
  useLazyGetActivitySummaryQuery,
} from '@/apis/processes';
import { formRequestUrlWithParams } from '@/utils/common';

interface UseActivitySSEProps {
  activityId: string;
  processId: string;
}

export function useActivitySSE({ activityId, processId }: UseActivitySSEProps) {
  const [getActivityLogs] = useLazyGetActivityLogsQuery();
  const [getArtifacts] = useLazyGetActivityArtifactsQuery();
  const [getActivitySummary] = useLazyGetActivitySummaryQuery();

  const handleUpdate = useCallback(
    (event: MessageEvent) => {
      const data = event?.data;

      if (!data) return;

      getActivityLogs({ processId, activityRunId: activityId });
      getArtifacts({ processId, activityRunId: activityId });
      getActivitySummary({ processId, activityRunId: activityId });
    },
    [getActivityLogs, getArtifacts, getActivitySummary, processId, activityId],
  );

  const { close: closeSSE } = useSSE({
    url: `${API_DOMAIN}/${formRequestUrlWithParams(API_ENDPOINTS.PROCESSES_EVENTS_GET, { activityId })}`,
    eventListeners: {
      update: handleUpdate,
    },
  });

  useEffect(() => {
    return () => {
      closeSSE();
    };
  }, []);

  return { closeSSE };
}
