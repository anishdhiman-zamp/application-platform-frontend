'use client';

import { FC, ReactNode } from 'react';
import { Provider } from 'react-redux';
import { FeatureFlagsProvider } from '@/modules/feature-flags/provider';
import { ProductionErrorBoundary } from '@/pages/ErrorBoundary';
import { store } from '@/store';

interface OnboardingLayoutProps {
  children: ReactNode;
}

const OnboardingLayout: FC<OnboardingLayoutProps> = ({ children }) => {
  return (
    <Provider store={store}>
      <FeatureFlagsProvider>
        <ProductionErrorBoundary>{children}</ProductionErrorBoundary>
      </FeatureFlagsProvider>
    </Provider>
  );
};

export default OnboardingLayout;
