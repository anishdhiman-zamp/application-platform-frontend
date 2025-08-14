import type { FC } from 'react';
import { RevealElement } from '@zamp-platform/ui';

interface ConditionalRevealAnimationProps {
  children: React.ReactNode;
  className?: string;
  isLastLog?: boolean;
}

const ConditionalRevealAnimation: FC<ConditionalRevealAnimationProps> = ({ children, className, isLastLog }) => {
  if (isLastLog) {
    return <RevealElement className={className}>{children}</RevealElement>;
  }

  return <div className={className}>{children}</div>;
};

export default ConditionalRevealAnimation;
