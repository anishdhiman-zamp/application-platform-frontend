'use client';

import { Plus, Puzzle, Settings, Shapes } from 'lucide-react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export function Header() {
  const pathname = usePathname();

  console.log('Header shown', pathname);
  // Only show header on valid routes (routes that start with /pace)
  // When accessing root without basePath, pathname will be null or '/'
  if (!pathname || !pathname.includes('/pace')) {
    console.log('Header not shown', pathname);

    return null;
  }

  return (
    <header className='border-GRAY_200 flex h-12 items-center justify-between border-b px-4'>
      <nav className='flex items-center gap-1'>
        <button className='text-GRAY_600 hover:bg-GRAY_100 flex h-8 w-8 items-center justify-center rounded-md'>
          <Image src='/pace/icons/pace.svg' alt='Pace Logo' width={16} height={16} unoptimized priority />
        </button>
        <button className='text-GRAY_600 hover:bg-GRAY_100 flex h-8 w-8 items-center justify-center rounded-md'>
          <Puzzle className='h-4 w-4' />
        </button>
        <button className='text-GRAY_600 hover:bg-GRAY_100 flex h-8 w-8 items-center justify-center rounded-md'>
          <Shapes className='h-4 w-4' />
        </button>
        <button className='text-GRAY_500 hover:bg-GRAY_100 flex h-8 w-8 items-center justify-center rounded-md'>
          <Plus className='h-4 w-4' />
        </button>
      </nav>
      <button className='text-GRAY_600 hover:bg-GRAY_100 flex h-8 w-8 items-center justify-center rounded-md'>
        <Settings className='h-4 w-4' />
      </button>
    </header>
  );
}
