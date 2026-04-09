import { cn } from '@zamp-platform/ui/utils';
import ZampLogo from '@/modules/chatbot/ZampLogo';

interface ZampIconProps {
  size?: number;
  className?: string;
}

const ZampIcon = ({ size = 20, className }: ZampIconProps) => {
  return (
    <div
      className={cn('grid place-items-center', className)}
      style={{ height: size, minHeight: size, width: size, minWidth: size }}
    >
      <ZampLogo size={size} className='text-foreground' />
    </div>
  );
};

export default ZampIcon;
