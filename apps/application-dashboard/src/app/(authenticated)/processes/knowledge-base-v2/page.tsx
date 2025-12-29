'use client';

import { useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useGetProcessesQuery } from '@/apis/pages';
import ImageLoader from '@/components/common/loader/ImageLoader';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import { ZAMP_LOGO_LOADER_SVG } from '@/constants/icons';
import { useAppDispatch } from '@/hooks/toolkit';
import KnowledgeBaseChat from '@/modules/process/knowledge-base-creation/KnowledgeBaseChat';
import ProcessCreationKnowledgeBase from '@/modules/process/knowledge-base-creation/ProcessCreationKnowledgeBase';
import ProcessInProcessBanner from '@/modules/process/knowledge-base-creation/ProcessInProcessBanner';
import { closeSidebar, openSidebar } from '@/store/slices/layout-configs';
import { ProcessStatus } from '@/types/api/processApi.types';

const KnowledgeBaseV2Page = () => {
  const dispatch = useAppDispatch();
  const params = useParams();
  const processId = params?.processId as string;

  const { data: processes, isLoading: isLoadingProcesses } = useGetProcessesQuery(undefined, {
    refetchOnMountOrArgChange: false,
  });

  const currentProcess = useMemo(() => processes?.find((process) => process.id === processId), [processes, processId]);

  useEffect(() => {
    setTimeout(() => {
      dispatch(closeSidebar());
    }, 300);

    return () => {
      dispatch(openSidebar());
    };
  }, [dispatch]);

  if (![ProcessStatus.DRAFT, ProcessStatus.LIVE].includes(currentProcess?.status as ProcessStatus)) {
    return <ProcessInProcessBanner />;
  }

  return (
    <CommonWrapper
      isLoading={isLoadingProcesses}
      skeletonType={SkeletonTypes.CUSTOM}
      loader={
        <div className='flex h-full min-h-[calc(100vh-88px)] w-full items-center justify-center'>
          <ImageLoader imageSrc={ZAMP_LOGO_LOADER_SVG} width={240} height={240} className='rounded-tl-xl' />
        </div>
      }
      className='h-full'
    >
      <div className='flex h-full w-full'>
        <div className='border-GRAY_400 h-full w-[444px] min-w-[444px] border-r'>
          <KnowledgeBaseChat processId={processId} status={currentProcess?.status} />
        </div>
        <div className='w-full'>
          <ProcessCreationKnowledgeBase processId={processId} processName={currentProcess?.display_name ?? ''} />
        </div>
      </div>
    </CommonWrapper>
  );
};

export default KnowledgeBaseV2Page;
