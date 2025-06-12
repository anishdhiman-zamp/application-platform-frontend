'use client';

import { FC, ReactNode } from 'react';
import Providers from 'app/_providers/providers';

interface AuthenticatedLayoutProps {
  children: ReactNode;
}

const LoginLayout: FC<AuthenticatedLayoutProps> = ({ children }) => {
  return <Providers>{children}</Providers>;
};

export default LoginLayout;
