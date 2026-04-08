import { FC } from 'react';
import { useSelector } from 'react-redux';
import { Button } from '@zamp-platform/ui';
import { useInitiateLogoutFlowQuery, useLazyLogoutQuery } from 'apis/auth';
import { ZAMP_BLACK_ICON } from 'constants/icons';
import { ROUTES_PATH } from 'constants/routeConfig';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { RootState } from 'store';
import { NoAccessPagePropsType } from 'components/common/noAccess/noAcessPage.types';

const NoAccessPage: FC<NoAccessPagePropsType> = ({ type }) => {
  const router = useRouter();
  const { data: initiateLogoutFlow, refetch: refetchLogoutFlow } = useInitiateLogoutFlowQuery();
  const [logOut] = useLazyLogoutQuery();
  const user_email = useSelector((state: RootState) => state?.user?.user)?.user_email;

  const handleLogout = async () => {
    logOut(initiateLogoutFlow?.logout_url ?? '')
      .then(() => {
        router.push(ROUTES_PATH.LOGIN);
      })
      .catch(() => {
        refetchLogoutFlow();
      });
  };

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
          src={ZAMP_BLACK_ICON}
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
        <Button variant='outline' testId='back-to-home' size='small' onClick={handleHomeBtn}>
          Back to Home
        </Button>
        <Button variant='outline' testId='logout' size='small' onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </div>
  );
};

export default NoAccessPage;
