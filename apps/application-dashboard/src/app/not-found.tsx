import { Button } from '@zamp-platform/ui';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className='flex min-h-screen flex-col items-center justify-center p-4'>
      <h2 className='mb-4 text-2xl font-bold'>Page Not Found</h2>
      <p className='mb-4 text-gray-600'>The page you're looking for doesn't exist.</p>
      <Button variant='secondary' size='small'>
        <Link href='/'>Go back home</Link>
      </Button>
    </div>
  );
}
