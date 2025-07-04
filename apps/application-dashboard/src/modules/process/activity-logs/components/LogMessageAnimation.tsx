import { type FC } from 'react';
import { ShimmerText, StaggerText } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { SENDER_TYPE } from 'modules/process/process.types';

type LogMessageAnimationProps = {
  text: string;
  className?: string;
  delay?: number;
  show?: boolean;
  showAnimation?: boolean;
  shimmer?: boolean;
  shimmerControlRef?: React.RefObject<(() => void) | null>;
  isLastLog?: boolean;
  senderType?: SENDER_TYPE;
};

const LogMessageAnimation: FC<LogMessageAnimationProps> = ({
  text,
  className = '',
  delay = 0,
  showAnimation = true,
  shimmer = false,
  shimmerControlRef,
  isLastLog = false,
  senderType,
}) => {
  const isSystemSender = senderType === SENDER_TYPE.SYSTEM;

  if (shimmer && isSystemSender) {
    return <ShimmerText text={text} shimmerControlRef={shimmerControlRef} />;
  }

  if (isLastLog && isSystemSender && !shimmer) {
    return <StaggerText text={text} showAnimation={showAnimation} delay={delay} className={className} />;
  }

  return <p className={cn('f-13-450 text-GRAY_1000 w-full text-left break-words', className)}>{text}</p>;
};

export default LogMessageAnimation;
