'use client';

import { Button } from '@zamp-platform/ui';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import OrgSwitcher from '@/components/layouts/dashboard-layout/components/OrgSwitcher';
import { ROUTES_PATH } from '@/constants/routeConfig';

interface NotFoundProps {
  showOrgSwitcher?: boolean;
}

export default function NotFound({ showOrgSwitcher = false }: NotFoundProps) {
  const pathname = usePathname();
  const homeHref = pathname?.startsWith(ROUTES_PATH.CHAT) ? ROUTES_PATH.CHAT : ROUTES_PATH.HOME;

  return (
    <div className='flex min-h-screen flex-col items-center justify-center gap-4 p-4'>
      <h2 className='text-2xl font-bold'>Page Not Found</h2>
      <p className='text-gray-600'>The page you&apos;re looking for doesn&apos;t exist.</p>
      {showOrgSwitcher && (
        <>
          <p className='text-GRAY_600 text-sm'>Try switching to a different organization:</p>
          <OrgSwitcher isSidebarOpen macs menuTriggerClassName='border border-GRAY_400 rounded-md' />
        </>
      )}
      <Link href={homeHref}>
        <Button variant='secondary' size='small'>
          Go back home
        </Button>
      </Link>
    </div>
  );
}
