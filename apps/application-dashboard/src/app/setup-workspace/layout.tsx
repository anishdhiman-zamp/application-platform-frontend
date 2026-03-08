'use client';

import { FC, ReactNode } from 'react';
import { Provider } from 'react-redux';
import { ProductionErrorBoundary } from '@/pages/ErrorBoundary';
import { store } from '@/store';

interface SetupWorkspaceLayoutProps {
  children: ReactNode;
}

const SetupWorkspaceLayout: FC<SetupWorkspaceLayoutProps> = ({ children }) => {
  return (
    <Provider store={store}>
      <ProductionErrorBoundary>{children}</ProductionErrorBoundary>
    </Provider>
  );
};

export default SetupWorkspaceLayout;
