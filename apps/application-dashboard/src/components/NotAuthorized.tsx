import React from 'react';

const NotAuthorized = () => {
  return (
    <div className='flex min-h-screen items-center justify-center bg-linear-to-br from-gray-100 to-gray-200'>
      <div className='mx-4 w-full max-w-md rounded-lg bg-white p-8 text-center shadow-xl'>
        <div className='mb-6'></div>
        <h1 className='mb-2 text-3xl text-gray-900 sm:text-4xl'>Restricted Access</h1>
        <p className='mb-8 text-xl text-gray-600'>You don&apos;t have access to this page.</p>
      </div>
    </div>
  );
};

export default NotAuthorized;
