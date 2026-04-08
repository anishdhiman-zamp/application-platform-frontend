import { cn } from '@zamp-platform/ui/utils';
import Image from 'next/image';
import { ZAMP_BLACK_ICON, ZAMP_WHITE_ICON } from '@/constants/icons';

interface ZampIconProps {
  size?: number;
  className?: string;
}

const ZampIcon = ({ size = 24, className }: ZampIconProps) => {
  const imageSize = Math.round(size * (20 / 24));

  return (
    <div
      className={cn('grid place-items-center', className)}
      style={{ height: size, minHeight: size, width: size, minWidth: size }}
    >
      <Image src={ZAMP_BLACK_ICON} alt='Zamp Icon' height={imageSize} width={imageSize} className='block dark:hidden' />
      <Image src={ZAMP_WHITE_ICON} alt='Zamp Icon' height={imageSize} width={imageSize} className='hidden dark:block' />
    </div>
  );
};

export default ZampIcon;
