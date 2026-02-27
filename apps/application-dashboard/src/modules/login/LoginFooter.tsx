import React from 'react';
import Link from 'next/link';

const LoginFooter = () => {
  return (
    <div className='text-GRAY_700 f-12-400 mt-6 text-center leading-[1.7]'>
      By using Zamp, you are agreeing to our
      <br />
      <Link
        href='https://www.zamp.finance/privacy-policy'
        className='border-GRAY_900/30 text-GRAY_900 hover:border-GRAY_1000/40 hover:text-GRAY_1000 border-b transition-colors duration-150'
        target='_blank'
        rel='noopener noreferrer'
      >
        Privacy Policy
      </Link>{' '}
      and{' '}
      <Link
        href='https://www.zamp.finance/terms-of-use'
        className='border-GRAY_900/30 text-GRAY_900 hover:border-GRAY_1000/40 hover:text-GRAY_1000 border-b transition-colors duration-150'
        target='_blank'
        rel='noopener noreferrer'
      >
        Terms of Service
      </Link>
      .
    </div>
  );
};

export default LoginFooter;
