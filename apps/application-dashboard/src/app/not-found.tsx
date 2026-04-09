'use client';

import { Button } from '@zamp-platform/ui';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ROUTES_PATH } from '@/constants/routeConfig';

export default function NotFound() {
  const pathname = usePathname();
  const homeHref = pathname?.startsWith(ROUTES_PATH.CHAT) ? ROUTES_PATH.CHAT : ROUTES_PATH.HOME;

  return (
    <div className='flex min-h-screen flex-col items-center justify-center p-4'>
      <h2 className='mb-4 text-2xl font-bold'>Page Not Found</h2>
      <p className='mb-4 text-gray-600'>The page you&apos;re looking for doesn&apos;t exist.</p>
      <Link href={homeHref}>
        <Button variant='secondary' size='small'>
          Go back home
        </Button>
      </Link>
    </div>
  );
}
