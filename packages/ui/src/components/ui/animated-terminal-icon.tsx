'use client';

import { cn } from '@zamp-platform/ui/utils';
import { FC, useEffect, useRef } from 'react';

import { CSS_VARS } from '../../constants/colors';
import { TerminalIcon, type TerminalIconHandle } from './terminal';

interface AnimatedTerminalIconProps {
  showAnimation: boolean;
  size?: number;
  className?: string;
  activeColor?: string;
  completeColor?: string;
}

export const AnimatedTerminalIcon: FC<AnimatedTerminalIconProps> = ({
  showAnimation,
  size = 12,
  className,
  activeColor = CSS_VARS.BLUE_700,
  completeColor = CSS_VARS.GRAY_700,
}) => {
  const iconRef = useRef<TerminalIconHandle>(null);

  useEffect(() => {
    if (showAnimation) {
      iconRef.current?.startAnimation();
    } else {
      iconRef.current?.stopAnimation();
    }
  }, [showAnimation]);

  return (
    <TerminalIcon
      ref={iconRef}
      size={size}
      className={cn(className)}
      style={{ color: showAnimation ? activeColor : completeColor }}
    />
  );
};
