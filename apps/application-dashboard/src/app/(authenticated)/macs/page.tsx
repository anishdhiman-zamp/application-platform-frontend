'use client';

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@zamp-platform/ui';
import MacsChat from '@/modules/macs/components/chat/MacsChat';
import SectionPanel from '@/modules/macs/components/SectionPanel';
import { useMacsContext } from '@/modules/macs/context/MacsContext';
import { usePanelSizes } from '@/modules/macs/hooks/usePanelSizes';
import { ViewMode } from '@/modules/macs/types';

const MacsPage = () => {
  const panelSizes = usePanelSizes();
  const { viewMode } = useMacsContext();

  return (
    <div className='flex h-full w-full'>
      <ResizablePanelGroup direction='horizontal' className='flex-1'>
        <ResizablePanel defaultSize={panelSizes.chat} minSize={panelSizes.chat} maxSize={panelSizes.chat} order={1}>
          <MacsChat className={viewMode === ViewMode.SectionExpanded ? 'w-[700px]' : 'w-full'} />
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
