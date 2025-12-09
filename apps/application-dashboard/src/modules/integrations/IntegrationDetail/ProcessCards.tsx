import { type FC } from 'react';
import { Activity, ArrowUpRight } from 'lucide-react';
import ImageKitImage from '@/components/ImageKitImage';

const ProcessCards: FC = () => {
  return (
    <div className='border-GRAY_400 group hover:border-GRAY_300 hover:bg-BG_GRAY_2 active:border-GRAY_300 active:bg-GRAY_100 flex h-[128px] w-full cursor-pointer flex-col justify-between rounded-md border bg-white p-3.5 transition-colors select-none'>
      <div className='flex items-center justify-between gap-x-2'>
        <div className='flex min-w-0 flex-1 items-center gap-x-1'>
          <Activity height={14} width={14} className='shrink-0 p-[2px]' />
          <span className='f-12-500 text-GRAY_1000 truncate' title='Accounts Payable'>
            Accounts Payable Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
          </span>
        </div>

        <ArrowUpRight width={14} height={14} className='text-GRAY_700 hidden shrink-0 group-hover:block' />
      </div>

      <div className='flex items-center justify-start gap-x-1'>
        <ImageKitImage src={'/integrations/logos/linear.svg'} width={22} height={22} alt='Linear' className='p-1' />
        <ImageKitImage src={'/integrations/logos/zapier.svg'} width={22} height={22} alt='Zapier' className='p-1' />
        <ImageKitImage src={'/integrations/logos/square.svg'} width={22} height={22} alt='Square' className='p-1' />
      </div>
    </div>
  );
};

export default ProcessCards;
