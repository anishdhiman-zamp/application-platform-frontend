import React from 'react';

const getSafeRenderable = (value: unknown): React.ReactNode => {
  if (value == null) return '';
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'object') return '';

  return value as React.ReactNode;
};

export const withLinkCellWrapper = (
  WrapperComponent: React.ComponentType<any>,
  CellRendererComponent?: React.ComponentType<any>,
) => {
  const WrappedRenderer = (props: any) => {
    const content = CellRendererComponent ? (
      <CellRendererComponent {...props} />
    ) : (
      <>{getSafeRenderable(props.valueFormatted)}</>
    );

    return <WrapperComponent {...props}>{content}</WrapperComponent>;
  };

  WrappedRenderer.displayName = 'WrappedRenderer';

  return WrappedRenderer;
};
