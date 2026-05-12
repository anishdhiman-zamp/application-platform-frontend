'use client';

import { useCallback, useEffect, useRef } from 'react';
import { Skeleton } from '@zamp-platform/ui';
import AgentTabEmptyState from 'modules/pace/components/agents/components/AgentTabEmptyState';
import { AGENT_TAB_HELPER_TEXT_CLASS } from 'modules/pace/components/agents/constants/agents.constants';
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
  <div className='border-GRAY_400 flex min-h-[300px] flex-col gap-5 rounded-xl border p-6'>
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
  agentAvatarSrc?: string;
  isActive?: boolean;
  skipFetch?: boolean;
  onUpdating?: () => void;
  onAddInstructions?: () => void;
}

const AgentInstructions = ({
  agentId,
  agentAvatarSrc,
  isActive = true,
  skipFetch = false,
  onUpdating,
  onAddInstructions,
}: AgentInstructionsProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasBeenActiveRef = useRef(isActive);
  const isFirstVisit = !hasBeenActiveRef.current && isActive;

  if (isActive) hasBeenActiveRef.current = true;

  const shouldSkip = !hasBeenActiveRef.current || skipFetch;

  const [updateInstructions] = useUpdateAgentInstructionsMutation();
  const { data, isLoading, isError, refetch } = useGetAgentInstructionsQuery({ agentId }, { skip: shouldSkip });

  const handleContentChange = useCallback(
    (newContent: string) => {
      onUpdating?.();

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

  useEffect(() => {
    if (isActive && !isFirstVisit && !skipFetch) refetch();
  }, [isActive, isFirstVisit, skipFetch, refetch]);

  return (
    <CommonWrapper
      isLoading={shouldSkip || isLoading}
      isError={isError}
      refetchFunction={refetch}
      isNoData={!isLoading && !instructions}
      noDataBanner={
        <AgentTabEmptyState
          agentAvatarSrc={agentAvatarSrc}
          description='Define what your agent should do every time it runs'
          actionLabel='Add instructions'
          onAction={onAddInstructions}
        />
      }
      skeletonType={SkeletonTypes.CUSTOM}
      loader={<InstructionsSkeleton />}
      className='flex flex-col'
      disableAnimation
    >
      <p className={AGENT_TAB_HELPER_TEXT_CLASS}>These instructions tell the agent what to do each time it runs.</p>
      <div className='agent-instructions-editor border-GRAY_400 flex min-h-[300px] flex-col overflow-hidden rounded-xl border'>
        <div ref={containerRef}>
          <MilkdownEditor content={instructions} onChange={handleContentChange} className='h-auto overflow-visible' />
        </div>
      </div>
    </CommonWrapper>
  );
};

export default AgentInstructions;
