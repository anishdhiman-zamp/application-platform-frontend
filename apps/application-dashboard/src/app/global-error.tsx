'use client';

import { useEffect } from 'react';
import { captureException } from '@sentry/browser';
import { ErrorCardTypes } from '@/components/commonWrapper/commonWrapper.types';
import ErrorCard from '@/components/commonWrapper/ErrorCard';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Global error boundary for Next.js App Router.
 * This catches errors in the root layout and provides a fallback UI.
 * Note: This only catches errors in the root layout. For route-specific errors,
 * use error.tsx files in route segments.
 */
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log the error to Sentry
    captureException(error, {
      extra: {
        digest: error.digest,
      },
    });
    console.error('Global error caught:', error);
  }, [error]);

  return (
    <html lang='en'>
      <body className='light-mode bg-BG_GRAY_1 h-screen antialiased'>
        <div className='flex h-screen w-full items-center justify-center'>
          <ErrorCard
            title='Something went wrong'
            className='w-full'
            subtitle='Please try again later'
            type={ErrorCardTypes.GENERAL_API_FAIL}
            onClose={reset}
          />
        </div>
      </body>
    </html>
  );
}
