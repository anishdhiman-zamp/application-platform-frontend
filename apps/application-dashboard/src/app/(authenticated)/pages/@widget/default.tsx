'use client';

import { useSearchParams } from 'next/navigation';
import WidgetPlayground from '@/modules/widgets/create/WidgetPlayground';

const WidgetPage = () => {
  const searchParams = useSearchParams();
  const isWidget = searchParams?.get('isWidget');

  if (isWidget === 'true') {
    return (
      <div className='absolute inset-0 z-[1001] rounded-tl-xl backdrop-blur-[30px]'>
        <WidgetPlayground />
      </div>
    );
  }

  return null;
};

export default WidgetPage;
