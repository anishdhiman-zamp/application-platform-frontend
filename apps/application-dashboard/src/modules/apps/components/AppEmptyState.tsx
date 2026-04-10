'use client';

import { Button } from '@zamp-platform/ui';
import { Globe, Plus } from 'lucide-react';

interface AppEmptyStateProps {
  onNewApp: () => void;
}

const AppEmptyState = ({ onNewApp }: AppEmptyStateProps) => {
  return (
    <div className='flex h-full flex-col items-center justify-center px-4'>
      <div className='flex max-w-lg flex-col items-start'>
        <div className='bg-BG_GRAY_2 mb-4 flex size-12 items-center justify-center rounded-xl'>
          <Globe size={24} className='text-GRAY_700' strokeWidth={1.5} />
        </div>

        <h2 className='text-GRAY_1000 f-20-500 mb-2'>Deploy your first app</h2>

        <p className='text-GRAY_700 f-14-400 mb-6'>
          Apps are static websites that you can build and deploy directly from chat. Tell the agent what you want to
          build, and it will create the code, configure the deployment, and give you a live URL.
        </p>

        <Button size='small' className='gap-1 rounded-md px-3 py-1.5' onClick={onNewApp}>
          <Plus size={14} />
          <span className='f-12-500'>New App</span>
        </Button>
      </div>
    </div>
  );
};

export default AppEmptyState;
