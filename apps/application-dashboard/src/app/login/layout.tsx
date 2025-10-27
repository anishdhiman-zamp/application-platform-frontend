'use client';

import { FC, ReactNode } from 'react';
import { Provider } from 'react-redux';
import { store } from '@/store';

interface LoginLayoutProps {
  children: ReactNode;
}

const LoginLayout: FC<LoginLayoutProps> = ({ children }) => {
  return <Provider store={store}>{children}</Provider>;
};

export default LoginLayout;
