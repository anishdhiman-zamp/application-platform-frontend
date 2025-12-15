'use client';

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@zamp-platform/ui';
import MacsChat from '@/modules/macs/components/MacsChat';
import SectionPanel from '@/modules/macs/components/SectionPanel';
import { useMacsContext } from '@/modules/macs/context/MacsContext';

const MacsPage = () => {
  const { hasTabs, chatPanelSize, setChatPanelSize } = useMacsContext();

  const handlePanelResize = (sizes: number[]) => {
    if (sizes[0] !== undefined) {
      setChatPanelSize(sizes[0]);
    }
  };

  return (
    <div className='flex h-full w-full flex-col'>
      {hasTabs ? (
        <ResizablePanelGroup direction='horizontal' className='flex-1' onLayout={handlePanelResize}>
          <ResizablePanel defaultSize={chatPanelSize} minSize={30} maxSize={50} id='chat-panel' order={1}>
            <MacsChat />
          </ResizablePanel>
          <ResizableHandle withHandle className='bg-gray-200' />
          <ResizablePanel defaultSize={100 - chatPanelSize} minSize={50} maxSize={70} id='section-panel' order={2}>
            <SectionPanel />
          </ResizablePanel>
        </ResizablePanelGroup>
      ) : (
        <MacsChat className='w-[600px]' showTopbar />
      )}
    </div>
  );
};

export default MacsPage;
