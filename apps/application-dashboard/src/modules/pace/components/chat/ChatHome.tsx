import NewPaceIcons from '@/assets/Icons/NewPaceIcons';
import { getGreeting } from '@/modules/pace/pace.utils';

const ChatHome = () => {
  const greeting = getGreeting();

  return (
    <div className='flex flex-col items-center gap-y-2.5'>
      <NewPaceIcons width={40} height={40} className='text-GRAY_1000 dark:text-GRAY_950' />
      <h1 className='f-20-500 text-GRAY_1000'>{greeting}</h1>
    </div>
  );
};

export default ChatHome;
