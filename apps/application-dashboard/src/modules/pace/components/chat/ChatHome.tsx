import ZampIcon from '@/modules/chatbot/ZampIcon';
import { getGreeting } from '@/modules/pace/pace.utils';

const ChatHome = () => {
  const greeting = getGreeting();

  return (
    <div className='flex snap-mandatory flex-col items-center gap-y-2.5 pt-4.5'>
      <ZampIcon size={32} interactive />
      <h1 className='f-20-500 text-GRAY_1000'>{greeting}</h1>
    </div>
  );
};

export default ChatHome;
