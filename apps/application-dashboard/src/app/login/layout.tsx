'use client';

import { FC, ReactNode } from 'react';
import { Provider } from 'react-redux';
import ErrorBoundary from '@/pages/ErrorBoundary';
import { store } from '@/store';

interface LoginLayoutProps {
  children: ReactNode;
}

const LoginLayout: FC<LoginLayoutProps> = ({ children }) => {
  return (
    <Provider store={store}>
      <ErrorBoundary>{children}</ErrorBoundary>
    </Provider>
  );
};

export default LoginLayout;
