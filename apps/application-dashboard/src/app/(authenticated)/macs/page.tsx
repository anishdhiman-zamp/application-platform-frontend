'use client';

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import MacsChat from '@/modules/macs/components/MacsChat';
import SectionPanel from '@/modules/macs/components/SectionPanel';
import { useMacsContext } from '@/modules/macs/context/MacsContext';
import { usePanelSizes } from '@/modules/macs/hooks/usePanelSizes';

const MacsPage = () => {
  const { hasTabs, isChatPanelExpanded } = useMacsContext();
  const panelSizes = usePanelSizes();

  return (
    <div className='flex h-full w-full'>
      <ResizablePanelGroup direction='horizontal' className='flex-1'>
        <ResizablePanel defaultSize={panelSizes.chat} minSize={panelSizes.chat} maxSize={panelSizes.chat} order={1}>
          <MacsChat className={cn(hasTabs || isChatPanelExpanded ? 'w-full' : 'w-[700px]')} />
        </ResizablePanel>
        <ResizableHandle withHandle className='bg-gray-200' />
        <ResizablePanel
          defaultSize={panelSizes.section}
          minSize={panelSizes.section}
          maxSize={panelSizes.section}
          order={2}
        >
          <SectionPanel />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default MacsPage;
