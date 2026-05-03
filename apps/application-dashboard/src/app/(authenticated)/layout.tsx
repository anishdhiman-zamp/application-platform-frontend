import { ReactNode } from 'react';
import LayoutProviders from 'app/_providers/layout-providers';
import { cookies } from 'next/headers';
import LayoutWrapper from '@/components/layouts/LayoutWrapper';
import { NAV_SIDEBAR_EXPANDED_COOKIE } from '@/utils/cookie';

interface AuthenticatedLayoutProps {
  children: ReactNode;
}

const AuthenticatedLayout = async ({ children }: AuthenticatedLayoutProps) => {
  const cookieStore = await cookies();
  const navSidebarCookie = cookieStore.get(NAV_SIDEBAR_EXPANDED_COOKIE)?.value;
  const initialNavSidebarExpanded = navSidebarCookie !== 'false';

  return (
    <LayoutProviders>
      <LayoutWrapper initialNavSidebarExpanded={initialNavSidebarExpanded}>{children}</LayoutWrapper>
    </LayoutProviders>
  );
};

export default AuthenticatedLayout;
