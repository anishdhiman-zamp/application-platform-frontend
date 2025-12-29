'use client';

import { useEffect, useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useGetProcessesQuery } from '@/apis/pages';
import ImageLoader from '@/components/common/loader/ImageLoader';
import { ZAMP_LOGO_LOADER_SVG } from '@/constants/icons';
import { getCreateKnowledgeBaseRouteByProcessId, ROUTES_PATH } from '@/constants/routeConfig';
import ProcessById from '@/modules/process/activity-runs/ProcessById';
import ProcessInProcessBanner from '@/modules/process/knowledge-base-creation/ProcessInProcessBanner';
import { ProcessStatus } from '@/types/api/processApi.types';

const Process = () => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: processes } = useGetProcessesQuery(undefined, {
    refetchOnMountOrArgChange: false,
  });

  const currentProcess = useMemo(
    () => processes?.find((process) => process.id === params?.processId),
    [processes, params?.processId],
  );

  const checkValidProcess = () => {
    if (params?.processId && processes) {
      const processId = params?.processId as string;
      const isValidProcessId = processes?.some((process) => process.id === processId);

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

  if (!processes?.length) {
    return <ImageLoader imageSrc={ZAMP_LOGO_LOADER_SVG} width={140} height={140} className='rounded-tl-xl' />;
  }

  if (![ProcessStatus.DRAFT, ProcessStatus.LIVE].includes(currentProcess?.status as ProcessStatus)) {
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
