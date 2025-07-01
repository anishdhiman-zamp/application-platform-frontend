import React from 'react';

export const withLinkCellWrapper = (
  WrapperComponent: React.ComponentType<any>,
  CellRendererComponent?: React.ComponentType<any>,
) => {
  const WrappedRenderer = (props: any) => {
    const content = CellRendererComponent ? <CellRendererComponent {...props} /> : <>{props.valueFormatted}</>;

    return <WrapperComponent {...props}>{content}</WrapperComponent>;
  };

  WrappedRenderer.displayName = 'WrappedRenderer';

  return WrappedRenderer;
};
