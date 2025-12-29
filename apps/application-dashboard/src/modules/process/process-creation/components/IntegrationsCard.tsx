import { useMemo } from 'react';
import { Database, Link } from 'lucide-react';
import { cn } from '@/utils/common';

export const CARD_TYPES = {
  TEXT: 'text',
  EMAIL: 'email',
  LINK: 'link',
  DATASET: 'dataset',
};

interface IntegrationsCardProps {
  type: keyof typeof CARD_TYPES;
  title: string;
  isFirstCard: boolean;
  isLastCard: boolean;
}

const IntegrationsCard = ({ type, title, isFirstCard, isLastCard }: IntegrationsCardProps) => {
  const style = useMemo(() => {
    return cn('flex items-center text-gray-900 bg-gray-100 h-6 px-1.5 f-12-450', {
      'rounded-l-sm': isFirstCard,
      'rounded-r-sm': isLastCard,
    });
  }, [isFirstCard, isLastCard]);

  switch (type) {
    case CARD_TYPES.TEXT:
      return <div className={cn('gap-1.5', style)}>Text</div>;
    case CARD_TYPES.EMAIL:
      return <div className={cn('gap-1.5', style)}>Email</div>;
    case CARD_TYPES.LINK:
      return (
        <div className={cn('gap-1.5', style)}>
          <Link size={12} className='cursor-pointer text-gray-900' />
          <div className='f-13-500'>{title}</div>
        </div>
      );
    case CARD_TYPES.DATASET:
      return (
        <div className={cn('gap-1.5', style)}>
          <Database size={12} className='cursor-pointer text-gray-900' />
          <div className='f-13-500'>{title}</div>
        </div>
      );
    default:
      return <div className={cn('gap-1.5', style)}>Unknown</div>;
  }
};

export default IntegrationsCard;
