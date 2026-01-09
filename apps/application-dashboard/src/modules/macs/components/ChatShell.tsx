'use client';

import type { ReactNode } from 'react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@zamp-platform/ui';
import SectionPanel from '@/modules/macs/components/SectionPanel';
import { usePanelSizes } from '@/modules/macs/hooks/usePanelSizes';

const ChatShell = ({ children }: { children: ReactNode }) => {
  const panelSizes = usePanelSizes();

  return (
    <div className='flex h-full w-full'>
      <ResizablePanelGroup direction='horizontal' className='flex-1'>
        <ResizablePanel
          id='macs-chat-panel'
          defaultSize={panelSizes.chat}
          minSize={panelSizes.chat}
          maxSize={panelSizes.chat}
          order={1}
        >
          {children}
        </ResizablePanel>
        <ResizableHandle className='bg-gray-200' />
        <ResizablePanel
          id='macs-section-panel'
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

export default ChatShell;
