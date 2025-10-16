// Create a factory function to make mock components
const createMockComponent = (displayName: string) => {
  const Component = ({ children, ...props }: { children: React.ReactNode; [key: string]: any }) => (
    <div data-testid={`mock-${displayName.toLowerCase()}`} {...props}>
      {children}
    </div>
  );

  Component.displayName = displayName;

  return Component;
};

// Create mock components with proper prop forwarding
const Panel = createMockComponent('Panel');
const PanelGroup = createMockComponent('PanelGroup');
const PanelResizeHandle = createMockComponent('PanelResizeHandle');
const ResizableHandle = createMockComponent('ResizableHandle');
const ResizablePanel = createMockComponent('ResizablePanel');
const ResizablePanelGroup = createMockComponent('ResizablePanelGroup');

// Mock imperative functions
const disableGlobalCursorStyles = jest.fn();

// Export the mocked components (ImperativePanelHandle is a TYPE, not exported as value)
module.exports = {
  __esModule: true,
  Panel,
  PanelGroup,
  PanelResizeHandle,
  disableGlobalCursorStyles,
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
  default: {},
};
