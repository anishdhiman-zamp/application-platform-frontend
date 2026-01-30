'use client';

import { useEffect, useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import ImageLoader from '@/components/common/loader/ImageLoader';
import { ZAMP_LOGO_LOADER_SVG } from '@/constants/icons';
import { getCreateKnowledgeBaseRouteByProcessId, ROUTES_PATH } from '@/constants/routeConfig';
import { usePagesAndProcessesData } from '@/hooks/usePagesAndProcessesData';
import ProcessById from '@/modules/process/activity-runs/ProcessById';
import ProcessInProcessBanner from '@/modules/process/knowledge-base-creation/ProcessInProcessBanner';
import { ProcessStatus } from '@/types/api/processApi.types';

const Process = () => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { processes, isLoadingProcesses } = usePagesAndProcessesData();

  const currentProcess = useMemo(
    () => processes?.find((process) => process?.process_id === params?.processId),
    [processes, params?.processId],
  );

  const checkValidProcess = () => {
    if (params?.processId && processes) {
      const processId = params?.processId as string;
      const isValidProcessId = processes?.some((process) => process?.process_id === processId);

      if (!isValidProcessId) {
        router.push(ROUTES_PATH.HOME);
      }
    }
  };

  useEffect(() => {
    checkValidProcess();
  }, [processes]);

  useEffect(() => {
    if (currentProcess?.status === ProcessStatus.DRAFT) {
      router.push(getCreateKnowledgeBaseRouteByProcessId(params?.processId as string));
    }
  }, [currentProcess]);

  if (isLoadingProcesses) {
    return <ImageLoader imageSrc={ZAMP_LOGO_LOADER_SVG} width={140} height={140} className='rounded-tl-xl' />;
  }

  if (currentProcess && ![ProcessStatus.DRAFT, ProcessStatus.LIVE].includes(currentProcess?.status as ProcessStatus)) {
    return <ProcessInProcessBanner />;
  }

  return (
    <ProcessById
      key={params?.processId as string}
      processId={params?.processId as string}
      status={searchParams?.get('status') as string}
    />
  );
};

export default Process;
