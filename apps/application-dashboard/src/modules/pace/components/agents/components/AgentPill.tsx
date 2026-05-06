'use client';

import { type FC, type RefObject, useCallback, useEffect, useRef, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@zamp-platform/ui';
import { getAgentAvatar, getAgentAvatarByKey } from 'modules/pace/components/agents/constants/agents.constants';
import { useGetAgentQuery } from '@/apis/agents';
import ImageKitImage from '@/components/ImageKitImage';
import { getChatAgentRoute } from '@/constants/routeConfig';
import AgentTestCard from '@/modules/pace/components/agents/components/AgentTestCard';
import { useDynamicTabs } from '@/modules/pace/components/dynamic-tabs/useDynamicTabs';
import { SINGLE_VIEWER_TAB_METADATA_KEY } from '@/modules/pace/pace.constants';
import { TAB_TYPE } from '@/modules/pace/pace.types';

interface AgentPillProps {
  agentId: string;
  agentName: string;
  avatarKey?: string;
  containerRef: RefObject<HTMLDivElement | null>;
  onOpenChange?: (open: boolean) => void;
}

const AgentPill: FC<AgentPillProps> = ({ agentId, agentName, avatarKey, containerRef, onOpenChange }) => {
  const triggerRef = useRef<HTMLDivElement>(null);
  const { openSingleTab: openSingleAgentTab, getTabById } = useDynamicTabs({ type: TAB_TYPE.AGENT });
  const tabAvatarKey = getTabById(agentId)?.metadata?.avatarKey as string | undefined;
  const { data: agentData } = useGetAgentQuery({ agentId }, { skip: !!(avatarKey || tabAvatarKey) });
  const resolvedAvatarKey = avatarKey || tabAvatarKey || agentData?.avatar || undefined;
  const avatar = (resolvedAvatarKey && getAgentAvatarByKey(resolvedAvatarKey)) || getAgentAvatar(agentName);
  const [isOpen, setIsOpen] = useState(false);
  const [alignOffset, setAlignOffset] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      setIsOpen(open);
      onOpenChange?.(open);
    },
    [onOpenChange],
  );

  const handleOpenTab = useCallback(() => {
    handleOpenChange(false);

    const metadata: Record<string, string> = {};

    if (resolvedAvatarKey) metadata.avatarKey = resolvedAvatarKey;
    metadata[SINGLE_VIEWER_TAB_METADATA_KEY] = 'true';

    openSingleAgentTab(
      agentId,
      agentName,
      metadata,
      getChatAgentRoute({ agentId, agentName, avatarKey: resolvedAvatarKey, inChat: true }),
    );
  }, [agentId, agentName, resolvedAvatarKey, openSingleAgentTab, handleOpenChange]);

  useEffect(() => {
    const el = containerRef.current;

    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });

    observer.observe(el);

    return () => observer.disconnect();
  }, [containerRef]);

  useEffect(() => {
    const trigger = triggerRef.current;
    const container = containerRef.current;

    if (!trigger || !container) return;

    setAlignOffset(container.getBoundingClientRect().left - trigger.getBoundingClientRect().left + 12);
  }, [containerWidth, containerRef]);

  return (
    <div className='relative'>
      <Popover open={isOpen} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <div
            ref={triggerRef}
            className='border-GRAY_400 bg-BG_GRAY_2 hover:bg-GRAY_200 flex w-fit cursor-pointer items-center gap-1.5 rounded-lg border p-2 transition-colors'
          >
            <div className='flex size-3.5 shrink-0 items-center justify-center'>
              <ImageKitImage
                src={avatar.src}
                alt={avatar.alt}
                width={14}
                height={14}
                className='size-full object-contain'
              />
            </div>
            <span className='f-13-450'>1</span>
          </div>
        </PopoverTrigger>

        <PopoverContent
          side='top'
          align='start'
          sideOffset={8}
          alignOffset={alignOffset}
          avoidCollisions={false}
          className='flex max-h-75 flex-col rounded-[20px]! p-0'
          style={
            containerWidth ? { width: containerWidth, minWidth: containerWidth, maxWidth: containerWidth } : undefined
          }
        >
          <div className='flex flex-1 flex-col gap-0.5 overflow-y-auto px-4 py-4 [scrollbar-width:thin]'>
            <div className='border-GRAY_400 bg-GRAY_100 overflow-hidden rounded-xl border'>
              <AgentTestCard
                agentId={agentId}
                agentName={agentName}
                avatar={avatar}
                onClick={handleOpenTab}
                onTriggerSelected={() => handleOpenChange(false)}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default AgentPill;
