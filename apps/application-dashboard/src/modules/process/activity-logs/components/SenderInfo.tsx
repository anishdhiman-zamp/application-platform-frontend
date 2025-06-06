import type { FC } from 'react';
import { LOG_STATUS, SENDER_TYPE } from 'modules/process/process.types';
import Image from 'next/image';
import { ADAM_ICON } from '@/constants/icons';
import { cn, getFirstLetters } from '@/utils/common';
interface SenderInfoProps {
  senderType: keyof typeof SENDER_TYPE;
  status: string;
  senderDetails: {
    sender_id: string;
    sender_name: string;
  };
}

interface SenderConfig {
  iconBgColor: string;
  iconContent: JSX.Element;
  displayName: string;
}

const SenderInfo: FC<SenderInfoProps> = ({ senderType, status, senderDetails }) => {
  const SENDER_CONFIG: Record<keyof typeof SENDER_TYPE, SenderConfig> = {
    [SENDER_TYPE.USER]: {
      iconBgColor: 'bg-BLUE_200',
      iconContent: <span className='f-10-450'>{getFirstLetters(senderDetails?.sender_name ?? 'U', 1)}</span>,
      displayName: senderDetails?.sender_name ?? '',
    },
    [SENDER_TYPE.SYSTEM]: {
      iconBgColor: 'bg-VIOLET_100',
      iconContent: <Image src={ADAM_ICON} alt='adam' width={10} height={10} priority />,
      displayName: 'Pace',
    },
  };

  const config = SENDER_CONFIG[senderType];

  if (!config) return null;

  return (
    <div
      className={cn('flex items-center justify-start gap-x-1.5 mt-3', {
        'bg-RED_200': status === LOG_STATUS.FAILED,
      })}
    >
      <div
        className={cn('size-4 rounded flex justify-center items-center', config.iconBgColor, {
          'bg-RED_950': status === LOG_STATUS.FAILED,
        })}
      >
        {config.iconContent}
      </div>
      <span className='f-13-450 text-GRAY_900'>{config.displayName}</span>
    </div>
  );
};

export default SenderInfo;
