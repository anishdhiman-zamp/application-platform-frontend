'use client';

import { useCallback, useEffect, useRef } from 'react';
import { Skeleton } from '@zamp-platform/ui';
import { useGetAgentInstructionsQuery, useUpdateAgentInstructionsMutation } from '@/apis/agents';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import { clientOnly } from '@/utils/clientOnly';

const AUTO_SAVE_DELAY_MS = 1000;

const SkeletonParagraph = ({ widths }: { widths: string[] }) => (
  <div className='flex flex-col gap-2.5'>
    {widths.map((w, i) => (
      <Skeleton key={i} className={`h-3.5 ${w}`} />
    ))}
  </div>
);

const InstructionsSkeleton = () => (
  <div className='border-GRAY_400 flex h-full min-h-[300px] flex-1 flex-col gap-5 rounded-xl border p-6'>
    <Skeleton className='h-5 w-48' />
    <SkeletonParagraph widths={['w-full', 'w-full', 'w-3/4']} />
    <Skeleton className='h-5 w-36' />
    <SkeletonParagraph widths={['w-full', 'w-5/6', 'w-full', 'w-2/3']} />
    <Skeleton className='h-5 w-44' />
    <SkeletonParagraph widths={['w-full', 'w-full', 'w-4/5']} />
    <Skeleton className='h-5 w-40' />
    <SkeletonParagraph widths={['w-full', 'w-3/4', 'w-full', 'w-5/6', 'w-2/3']} />
  </div>
);

const MilkdownEditor = clientOnly(
  () => import('modules/pace/components/file-viewer/viewers/MilkdownEditor'),
  InstructionsSkeleton,
);

interface AgentInstructionsProps {
  agentId: string;
  isActive?: boolean;
  skipFetch?: boolean;
  onUpdating?: (updating: boolean) => void;
}

const AgentInstructions = ({ agentId, isActive = true, skipFetch = false, onUpdating }: AgentInstructionsProps) => {
  const prevFetchingRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shimmerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shouldSkip = !isActive || skipFetch;

  const [updateInstructions] = useUpdateAgentInstructionsMutation();
  const { data, isLoading, isError, isFetching, refetch } = useGetAgentInstructionsQuery(
    { agentId },
    { skip: shouldSkip },
  );

  useEffect(() => {
    if (!prevFetchingRef.current && isFetching && !isLoading) {
      onUpdating?.(true);
      if (shimmerTimerRef.current) clearTimeout(shimmerTimerRef.current);
      shimmerTimerRef.current = setTimeout(() => onUpdating?.(false), 3000);
    }
    prevFetchingRef.current = isFetching;
  }, [isFetching, isLoading, onUpdating]);

  useEffect(() => {
    return () => {
      if (shimmerTimerRef.current) clearTimeout(shimmerTimerRef.current);
    };
  }, []);

  const handleContentChange = useCallback(
    (newContent: string) => {
      onUpdating?.(true);
      if (shimmerTimerRef.current) clearTimeout(shimmerTimerRef.current);
      shimmerTimerRef.current = setTimeout(() => onUpdating?.(false), 3000);

      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }

      autoSaveTimerRef.current = setTimeout(() => {
        updateInstructions({ agentId, instructions: newContent });
      }, AUTO_SAVE_DELAY_MS);
    },
    [agentId, updateInstructions, onUpdating],
  );

  const instructions = data?.content ?? '';

  return (
    <CommonWrapper
      isLoading={shouldSkip || isLoading}
      isError={isError}
      refetchFunction={refetch}
      isNoData={!isLoading && !instructions}
      noDataBanner={
        <div className='border-GRAY_400 flex min-h-75 items-center justify-center rounded-xl border'>
          <p className='f-13-450 text-GRAY_700'>No instructions found</p>
        </div>
      }
      skeletonType={SkeletonTypes.CUSTOM}
      loader={<InstructionsSkeleton />}
      className='flex min-h-0 flex-1 flex-col'
      disableAnimation
    >
      <p className='text-GRAY_700 f-14-450 mb-4 ml-2.5 shrink-0'>What should the agent do everytime it runs?</p>
      <div className='agent-instructions-editor border-GRAY_400 flex h-full flex-col overflow-hidden rounded-xl border'>
        <div ref={containerRef} className='min-h-0 flex-1'>
          <MilkdownEditor content={instructions} onChange={handleContentChange} />
        </div>
      </div>
    </CommonWrapper>
  );
};

export default AgentInstructions;
