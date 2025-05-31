'use client';

import { FC, ReactNode } from 'react';
import DashboardContent from 'app/DashboardContent';

interface AuthenticatedLayoutProps {
  children: ReactNode;
}

const AuthenticatedLayout: FC<AuthenticatedLayoutProps> = ({ children }) => {
  return <DashboardContent>{children}</DashboardContent>;
};

export default AuthenticatedLayout;
