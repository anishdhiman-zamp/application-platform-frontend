'use client';

import type { Variants } from 'motion/react';
import { motion, useAnimation } from 'motion/react';
import type { HTMLAttributes } from 'react';
import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';
import React from 'react';

import { cn } from '@zamp-platform/ui/utils';

export interface AgentNavIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface AgentNavIconProps extends HTMLAttributes<HTMLDivElement> {
  size?: number;
}

const ICON_VARIANTS: Variants = {
  normal: {
    scale: 1,
    rotate: 0,
  },
  animate: {
    scale: 1.01,
    rotate: [0, -10, 10, 0],
    transition: {
      rotate: {
        duration: 0.5,
        ease: 'easeInOut',
      },
      scale: {
        type: 'spring',
        stiffness: 400,
        damping: 10,
      },
    },
  },
};

const BODY_PATH =
  'M3.43834 0.521833C3.73582 0.486387 4.23416 0.50929 4.55388 0.513265C4.86778 0.517169 5.88351 0.418371 6.04532 0.70667C6.29275 1.14754 5.98885 2.47636 6.24482 2.85372C6.55831 3.01735 7.14858 2.9462 7.50068 2.93637C7.90606 2.92504 7.85941 2.51391 7.85938 2.22499C7.85935 1.92166 7.856 1.60394 7.85605 1.29922C7.8471 0.589731 8.01162 0.504067 8.68283 0.510975C9.20285 0.516327 9.75858 0.512599 10.2823 0.51039C10.4826 0.507093 10.8645 0.514198 10.9666 0.731733C11.207 1.24359 10.8826 2.38472 11.1644 2.85425C11.6785 3.11839 12.925 2.77495 13.3116 3.06538C13.4182 3.14545 13.4571 3.25193 13.4754 3.38059C13.519 3.68614 13.4901 4.19655 13.4901 4.52517L13.4895 6.84847L13.4899 10.8773L13.4899 12.1936C13.4899 12.4342 13.4944 12.6764 13.4865 12.9168C13.4741 13.2957 13.3813 13.4261 13.0014 13.4776C12.743 13.5037 12.0648 13.4855 11.7804 13.4852L9.36518 13.4849L3.75688 13.4854L2.17316 13.4858C1.86951 13.4858 0.654396 13.5882 0.575502 13.2431C0.464686 12.7583 0.511307 12.0435 0.511346 11.5262L0.511295 8.8328L0.510764 5.30509L0.509974 4.15515C0.509803 3.80431 0.408282 3.08869 0.841302 2.98567C1.38275 2.85687 2.34286 3.07901 2.83184 2.85719C3.13207 2.38709 2.76453 1.07973 3.06005 0.697775C3.1592 0.56961 3.28687 0.541654 3.43834 0.521833Z';

const LEFT_EYE_PATH =
  'M5.02132 10.2908C5.10016 10.279 5.28773 10.2352 5.31734 10.1572C5.43041 9.85923 5.47199 8.8847 5.24913 8.66555C5.15624 8.57421 4.26801 8.60584 4.09776 8.61135C3.62596 8.65207 3.70749 8.99044 3.70105 9.3748C3.69435 9.7744 3.61237 10.3446 4.1825 10.2971C4.45207 10.2878 4.74961 10.2976 5.02132 10.2908Z';

const RIGHT_EYE_PATH =
  'M9.93363 10.2908C10.3359 10.2306 10.2922 9.95753 10.297 9.6276C10.2998 9.4437 10.3338 8.75227 10.1643 8.67874C9.89667 8.56269 9.2945 8.60085 8.99185 8.61109C8.92443 8.61775 8.72722 8.64151 8.69914 8.70351C8.56708 8.99503 8.52386 10.0266 8.75508 10.2291C8.87209 10.3316 9.73037 10.2931 9.93363 10.2908Z';

const AgentNavIcon = forwardRef<AgentNavIconHandle, AgentNavIconProps>(
  ({ onMouseEnter, onMouseLeave, className, size = 28, ...props }, ref) => {
    const controls = useAnimation();
    const isControlledRef = useRef(false);

    useImperativeHandle(ref, () => {
      isControlledRef.current = true;

      return {
        startAnimation: () => controls.start('animate'),
        stopAnimation: () => controls.start('normal'),
      };
    });

    const handleMouseEnter = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (isControlledRef.current) {
          onMouseEnter?.(e);
        } else {
          controls.start('animate');
        }
      },
      [controls, onMouseEnter],
    );

    const handleMouseLeave = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (isControlledRef.current) {
          onMouseLeave?.(e);
        } else {
          controls.start('normal');
        }
      },
      [controls, onMouseLeave],
    );

    return (
      <div className={cn(className)} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} {...props}>
        <motion.svg
          animate={controls}
          variants={ICON_VARIANTS}
          fill='none'
          height={size}
          width={size}
          viewBox='0 0 14 14'
          stroke='currentColor'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path d={BODY_PATH} />
          <path d={LEFT_EYE_PATH} />
          <path d={RIGHT_EYE_PATH} />
        </motion.svg>
      </div>
    );
  },
);

AgentNavIcon.displayName = 'AgentNavIcon';

export { AgentNavIcon };
