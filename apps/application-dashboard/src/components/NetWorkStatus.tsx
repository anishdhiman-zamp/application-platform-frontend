'use client';

import { useEffect, useState } from 'react';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { COLORS } from 'constants/colors';
import { ICON_SPRITE_TYPES } from 'constants/icons';

function NetworkStatus() {
  const [isOffline, setIsOffline] = useState(false);

  const handleOnline = () => {
    setIsOffline(false);
  };
  const handleOffline = () => {
    setIsOffline(true);
  };

  useEffect(() => {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    isOffline && (
      <div className='fixed top-2 left-1/2 z-100 -translate-x-1/2 transform'>
        <div className='shadow-GRAY_50 border-GRAY_400 f-14-400 animate-slide-in mt-5 flex w-[400px] items-center justify-between rounded-lg border bg-white p-5 shadow-xl'>
          <div className='flex items-center gap-2'>
            <SvgSpriteLoader
              id='wifi-off'
              iconCategory={ICON_SPRITE_TYPES.GENERAL}
              width={16}
              height={16}
              color={COLORS.RED_800}
            />
            <span className='f-14-400 text-gray-950'> It seems that you are offline!</span>
          </div>
        </div>
      </div>
    )
  );
}
export default NetworkStatus;
