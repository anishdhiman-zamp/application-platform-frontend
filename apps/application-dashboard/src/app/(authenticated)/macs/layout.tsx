'use client';

import { type ReactNode } from 'react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@zamp-platform/ui';
import ChatTopbar from '@/modules/macs/components/ChatTopbar';
import MacsChat from '@/modules/macs/components/MacsChat';
import MacsTopbar from '@/modules/macs/components/MacsTopbar';
import SectionPanel from '@/modules/macs/components/SectionPanel';
import CapabilitiesSection from '@/modules/macs/components/sections/CapabilitiesSection';
import ComponentsSection from '@/modules/macs/components/sections/ComponentsSection';
import { MacsProvider, useMacsContext } from '@/modules/macs/context/MacsContext';

const FullPageSectionContent = ({ section }: { section: 'capabilities' | 'components' }) => {
  switch (section) {
    case 'capabilities':
      return <CapabilitiesSection />;
    case 'components':
      return <ComponentsSection />;
    default:
      return null;
  }
};

const MacsLayoutContent = ({ children }: { children: ReactNode }) => {
  const { hasTabs, chatPanelSize, setChatPanelSize, fullPageSection } = useMacsContext();

  const handlePanelResize = (sizes: number[]) => {
    if (sizes[0] !== undefined) {
      setChatPanelSize(sizes[0]);
    }
  };

  if (fullPageSection) {
    return (
      <div className='flex h-full w-full flex-col'>
        <MacsTopbar className='w-full' />
        <div className='flex-1'>
          <FullPageSectionContent section={fullPageSection} />
        </div>
        {children}
      </div>
    );
  }

  return (
    <div className='flex h-full w-full flex-col'>
      {/* Topbar row */}
      <div className='flex w-full'>
        {hasTabs ? (
          <>
            <ChatTopbar
              className='border-r border-gray-400'
              style={{ width: `${chatPanelSize}%` }}
              showExpandMinimize
            />
            <MacsTopbar style={{ width: `${100 - chatPanelSize}%` }} />
          </>
        ) : (
          <MacsTopbar className='w-full' />
        )}
      </div>

      {/* Content area */}
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

      {children}
    </div>
  );
};

const MacsLayout = ({ children }: { children: ReactNode }) => {
  return (
    <MacsProvider>
      <MacsLayoutContent>{children}</MacsLayoutContent>
    </MacsProvider>
  );
};

export default MacsLayout;
