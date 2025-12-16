'use client';

// Import resource to register it with Battalion
import { PageList, TransactionInfo } from 'app/(authenticated)/battalion-example/components';
import 'app/(authenticated)/battalion-example/resources';

export default function BattalionExamplePage() {
  return (
    <div className='container mx-auto max-w-4xl overflow-auto px-4 py-8'>
      {/* Header */}
      <header className='mb-8'>
        <h1 className='mb-2 text-3xl font-bold text-gray-900'>Battalion Example</h1>
        <p className='text-gray-600'>
          Using <code className='rounded bg-gray-100 px-1'>useResource&lt;Page&gt;(&apos;Page&apos;)</code> with real
          API endpoints
        </p>
      </header>

      {/* Main Content */}
      <div className='grid gap-6 md:grid-cols-[1fr,300px]'>
        <PageList />
        <TransactionInfo />
      </div>
    </div>
  );
}
