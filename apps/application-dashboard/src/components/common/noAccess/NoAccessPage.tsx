import React, { FC } from 'react';
import { useSelector } from 'react-redux';
import { ZAMP_ICON } from 'constants/icons';
import { ROUTES_PATH } from 'constants/routeConfig';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { RootState } from 'store';
import { SIZE_TYPES } from 'types/common/components';
import { BUTTON_TYPES } from 'types/components/button.type';
import { useLogout } from '@/hooks/useLogout';
import { Button } from 'components/common/button/Button';
import { NoAccessPagePropsType } from 'components/common/noAccess/noAcessPage.types';

const NoAccessPage: FC<NoAccessPagePropsType> = ({ type }) => {
  const router = useRouter();
  const { logout, isLoggingOut } = useLogout();

  const user_email = useSelector((state: RootState) => state?.user?.user)?.user_email;

  const handleHomeBtn = () => {
    router.push(ROUTES_PATH.HOME);
  };

  return (
    <div className='flex h-screen w-screen flex-col items-center justify-center bg-white'>
      <div>
        <Image
          width={60}
          height={60}
          alt='zamp logo'
          className='w-8 cursor-pointer align-middle'
          src={ZAMP_ICON}
          priority={true}
        />
      </div>
      <div className='flex flex-col items-center justify-center'>
        <span className='f-16-600 mt-4'>You do not have access to this {type}</span>
        <span className='f-13-400 text-GRAY_600 mt-4'>You may need to contact the page owner for access.</span>
        <span className='f-13-400 text-GRAY_600 mt-4'>You&apos;re logged in as</span>
        <span className='f-13-600 text-GRAY_950 mt-1'>{user_email}</span>
      </div>
      <div className='mt-6 flex gap-2.5'>
        <Button type={BUTTON_TYPES.SECONDARY} id='back-to-home' size={SIZE_TYPES.SMALL} onClick={handleHomeBtn}>
          Back to Home
        </Button>
        <Button
          type={BUTTON_TYPES.SECONDARY}
          id='logout'
          size={SIZE_TYPES.SMALL}
          onClick={logout}
          disabled={isLoggingOut}
        >
          Logout
        </Button>
      </div>
    </div>
  );
};

export default NoAccessPage;
