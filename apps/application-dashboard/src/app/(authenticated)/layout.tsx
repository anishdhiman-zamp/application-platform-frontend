import { FC, ReactNode } from 'react';
import LayoutProviders from 'app/_providers/layout-providers';
import LayoutWrapper from '@/components/layouts/LayoutWrapper';

interface AuthenticatedLayoutProps {
  children: ReactNode;
}

const AuthenticatedLayout: FC<AuthenticatedLayoutProps> = ({ children }) => {
  return (
    <LayoutProviders>
      <LayoutWrapper>{children}</LayoutWrapper>
    </LayoutProviders>
  );
};

export default AuthenticatedLayout;
