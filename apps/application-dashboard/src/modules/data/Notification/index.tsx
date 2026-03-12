import { FC, useRef, useState } from 'react';
import { COLORS } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import ProgressBar from 'components/common/RingProgress';

type NotificationProps = {
  isPolling: boolean;
  message?: string;
};

const Notification: FC<NotificationProps> = ({ isPolling, message = 'Tagging in progress' }: NotificationProps) => {
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleNotificationPanel = () => {
    setShowNotificationPanel((prev) => !prev);
  };

  return (
    <>
      {isPolling ? (
        <div className='relative h-5.5 w-5.5 cursor-pointer rounded' onClick={toggleNotificationPanel}>
          <div className='hover:bg-GRAY_100 flex h-full w-full items-center justify-center rounded'>
            <ProgressBar
              trackColor={COLORS.GRAY_400}
              indicatorColor={'#22A356'}
              indicatorWidth={2}
              trackWidth={2}
              size={16}
              className='animate-spin'
              progress={20}
            />
          </div>
          {showNotificationPanel && (
            <div
              ref={dropdownRef}
              className='f-13-500 text-GRAY_1000 f-12-450 border-0.5 border-GRAY_500 absolute top-7 -right-[86px] z-1000 flex h-[55px] w-[308px] items-center gap-3 rounded-[10px] bg-white p-5'
            >
              <ProgressBar
                trackColor={COLORS.GRAY_400}
                indicatorColor={'#22A356'}
                indicatorWidth={2}
                trackWidth={2}
                size={16}
                className='animate-spin'
                progress={20}
              />
              <div className='grow'>{message}</div>
              <SvgSpriteLoader
                id='x-close'
                width={16}
                height={16}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowNotificationPanel(false);
                }}
                className='text-GRAY_800 hover:text-GRAY_1000'
              />
            </div>
          )}
        </div>
      ) : null}
    </>
  );
};

export default Notification;
