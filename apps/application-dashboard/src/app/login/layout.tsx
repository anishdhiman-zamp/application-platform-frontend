'use client';

import { FC, ReactNode } from 'react';
import { Provider } from 'react-redux';
import { AnonymousFeatureFlagsProvider } from '@/modules/feature-flags/anonymous-provider';
import { ProductionErrorBoundary } from '@/pages/ErrorBoundary';
import { store } from '@/store';

interface LoginLayoutProps {
  children: ReactNode;
}

const LoginLayout: FC<LoginLayoutProps> = ({ children }) => {
  return (
    <Provider store={store}>
      <AnonymousFeatureFlagsProvider>
        <ProductionErrorBoundary>{children}</ProductionErrorBoundary>
      </AnonymousFeatureFlagsProvider>
    </Provider>
  );
};

export default LoginLayout;
