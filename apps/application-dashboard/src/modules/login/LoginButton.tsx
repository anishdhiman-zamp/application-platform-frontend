import { FC, MouseEvent, useEffect, useState } from 'react';
import Image from 'next/image';
import { cn } from 'utils/common';

type LoginButtonPropsType = {
  loading: boolean;
  onClick: (e?: MouseEvent<HTMLButtonElement>) => void;
  providerLogo: string;
};

const LoginButton: FC<LoginButtonPropsType> = ({ loading, onClick, providerLogo }) => {
  const [isOIDCLogoLoaded, setIsOICLogoLoaded] = useState(false);
  const showSigningIn = providerLogo?.length > 0 && isOIDCLogoLoaded;

  useEffect(() => {
    if (providerLogo) {
      const img = new window.Image();

      img.src = providerLogo;
      img.onload = () => {
        setTimeout(() => {
          setIsOICLogoLoaded(true);
        }, 300);
      };
    } else {
      setIsOICLogoLoaded(false);
    }
  }, [providerLogo]);

  return (
    <button
      id='google-login'
      type='submit'
      className={cn(
        'bg-BG_GRAY_3 relative mt-4 h-12 w-full rounded-md',
        loading ? 'cursor-not-allowed!' : 'cursor-pointer!',
      )}
      onClick={onClick}
    >
      <div
        className={cn(
          'color-transition before:bg-BG_GRAY_3 after:bg-BG_GRAY_4 relative z-10 h-full w-full overflow-hidden rounded-md before:absolute before:top-0 before:h-full before:w-full before:translate-x-0 before:transform before:rounded-[6px] before:transition-transform before:duration-3000 before:ease-in-out after:absolute after:top-0 after:h-full after:w-full after:-translate-x-1/2 after:transform after:rounded-[6px] after:transition-transform after:duration-3000 after:ease-in-out',
          { active: loading },
        )}
      >
        <div className='absolute top-[12px] right-40 z-40 text-white'>
          {showSigningIn ? (
            <div className='f-14-500 animate-opacity flex items-center justify-center gap-1.5 text-white'>
              <span>Signing in with</span>
              <Image src={providerLogo} alt='provider logo' width={40} height={20} style={{ maxHeight: '20px' }} />
            </div>
          ) : (
            <span className='mr-10'>Login</span>
          )}
        </div>
      </div>
    </button>
  );
};

export default LoginButton;
