import { Button } from '@zamp-platform/ui';
import Link from 'next/link';

//not found page
export default function NotFound() {
  return (
    <div className='flex min-h-screen flex-col items-center justify-center p-4'>
      <h2 className='mb-4 text-2xl font-bold'>Page Not Found</h2>
      <p className='mb-4 text-gray-600'>The page you&apos;re looking for doesn&apos;t exist.</p>
      <Link href='/pace'>
        <Button variant='secondary' size='small'>
          Go back home
        </Button>
      </Link>
    </div>
  );
}
