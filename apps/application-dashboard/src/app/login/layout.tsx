'use client';

import { FC, ReactNode } from 'react';
import { Provider } from 'react-redux';
import { store } from '@/store';

interface AuthenticatedLayoutProps {
  children: ReactNode;
}

const LoginLayout: FC<AuthenticatedLayoutProps> = ({ children }) => {
  return <Provider store={store}>{children}</Provider>;
};

export default LoginLayout;
