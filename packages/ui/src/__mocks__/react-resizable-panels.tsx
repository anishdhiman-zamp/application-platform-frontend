import React from 'react';

// Mock implementation of react-resizable-panels for Jest tests
export const PanelGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { direction?: 'horizontal' | 'vertical' }
>(({ children, ...props }, ref) => {
  return (
    <div ref={ref} {...props}>
      {children}
    </div>
  );
});

PanelGroup.displayName = 'PanelGroup';

export const Panel = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, ...props }, ref) => {
    return (
      <div ref={ref} {...props}>
        {children}
      </div>
    );
  },
);

Panel.displayName = 'Panel';

export const PanelResizeHandle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, ...props }, ref) => {
    return (
      <div ref={ref} {...props}>
        {children}
      </div>
    );
  },
);

PanelResizeHandle.displayName = 'PanelResizeHandle';

export const disableGlobalCursorStyles = jest.fn();

export type ImperativePanelHandle = {
  collapse: () => void;
  expand: () => void;
  resize: (size: number) => void;
};

export type ImperativePanelGroupHandle = {
  getLayout: () => number[];
  setLayout: (sizes: number[]) => void;
};
