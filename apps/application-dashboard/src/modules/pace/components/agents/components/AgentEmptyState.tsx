'use client';

import { Button } from '@zamp-platform/ui';
import { Plus } from 'lucide-react';
import { AGENT_AVATARS } from 'modules/pace/components/agents/constants/agents.constants';
import ImageKitImage from '@/components/ImageKitImage';

interface AgentEmptyStateProps {
  onNewAgent: () => void;
}

const AgentEmptyState = ({ onNewAgent }: AgentEmptyStateProps) => {
  return (
    <div className='flex h-full flex-col items-center justify-center px-4'>
      <div className='flex max-w-lg flex-col items-start'>
        <div className='mb-4 flex items-center gap-1'>
          {AGENT_AVATARS.slice(0, 9).map((avatar) => (
            <ImageKitImage
              key={avatar.key}
              src={avatar.src}
              alt={avatar.alt}
              width={24}
              height={24}
              className='h-6 w-6 object-contain'
            />
          ))}
        </div>

        <h2 className='text-GRAY_1000 f-20-500 mb-2'>Introducing Agents</h2>

        <p className='text-GRAY_700 f-14-400 mb-6'>
          Agents are digital employees that follow the precise instructions you define and operate only on the files and
          external connections you explicitly grant access to. You can collaborate with them in chat or run them
          autonomously in the background via triggers and schedules. You can also share them with your teammates.
        </p>

        <Button size='small' className='gap-1 rounded-md px-3 py-1.5' onClick={onNewAgent}>
          <Plus size={14} />
          <span className='f-12-500'>New Agent</span>
        </Button>
      </div>
    </div>
  );
};

export default AgentEmptyState;
