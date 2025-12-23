'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';

interface PaceCursorProps {
  x: number;
  y: number;
}

const MESSAGES = [
  'Hey! Pace here.',
  "Let's create a process",
  "I'm following your instructions",
  "What's this?",
  'Show me more!',
  'Interesting...',
  'Analyzing...',
  'Awaiting input',
  'Scanning pattern',
];

export const PaceCursor = ({ x, y }: PaceCursorProps) => {
  const [message, setMessage] = useState(MESSAGES[0]);
  const [isHighFiving, setIsHighFiving] = useState(false);
  const hoverTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      // Only cycle messages if not high-fiving
      if (!isHighFiving && Math.random() > 0.7) {
        setMessage(MESSAGES[Math.floor(Math.random() * MESSAGES.length)]);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isHighFiving]);

  useEffect(() => {
    if (isHighFiving) return;

    const moveMessages = ['Oh!', 'Here?', 'Checking...', 'On my way'];

    if (Math.random() > 0.8) {
      setMessage(moveMessages[Math.floor(Math.random() * moveMessages.length)]);
    }
  }, [x, y, isHighFiving]);

  const handleMouseEnter = () => {
    hoverTimer.current = setTimeout(() => {
      setIsHighFiving(true);
      setMessage('High Five!');
    }, 300);
  };

  const handleMouseLeave = () => {
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
    setIsHighFiving(false);
  };

  return (
    <motion.div
      className='pointer-events-none absolute z-50'
      animate={{ x, y }}
      transition={{
        type: 'spring',
        damping: 25,
        stiffness: 200,
        mass: 0.5,
      }}
      style={{
        left: 0,
        top: 0,
      }}
    >
      <div className='relative'>
        {/* Cursor SVG - Floating Animation or High Five */}
        <motion.div
          className='absolute top-0 left-0 h-[16.365px] w-[14.698px] -translate-x-[2px] -translate-y-[2px]'
          animate={
            isHighFiving
              ? {
                  rotate: [0, -20, 20, -20, 0],
                  scale: [1, 1.2, 1],
                }
              : {
                  y: [0, -6, 0],
                  rotate: 0,
                  scale: 1,
                }
          }
          transition={
            isHighFiving
              ? {
                  duration: 0.5,
                  repeat: Infinity,
                  repeatDelay: 0.5,
                }
              : {
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }
          }
        >
          {isHighFiving ? (
            <div className='-mt-1 -ml-1 text-[24px] select-none'>✋</div>
          ) : (
            <div className='h-full w-full rotate-[324deg]'>
              <div className='relative size-full'>
                <div className='absolute inset-[3.17%_-6.74%_-12.68%_-6.4%]'>
                  <svg className='block size-full' fill='none' preserveAspectRatio='none' viewBox='0 0 17 18'>
                    <g filter='url(#filter0_d_1_863_pace)'>
                      <path
                        d='M7.37765 1.51235C7.73112 0.725204 8.84868 0.725202 9.20214 1.51234L14.6948 13.744C15.0531 14.5421 14.2863 15.3831 13.4586 15.0997L8.21202 13.3033C7.9901 13.2273 7.74852 13.2317 7.52955 13.3158L3.20547 14.9765C2.37229 15.2965 1.56908 14.4476 1.9347 13.6334L7.37765 1.51235Z'
                        fill='#333333'
                      />
                      <path
                        d='M7.79844 1.70155C7.98896 1.27727 8.59132 1.27727 8.78184 1.70155L14.274 13.933C14.4671 14.3631 14.0541 14.8162 13.608 14.6635L8.36094 12.8676C8.03678 12.7566 7.68372 12.7623 7.36387 12.8851L3.04063 14.5463C2.59168 14.7187 2.15847 14.2614 2.35508 13.8226L7.79844 1.70155Z'
                        stroke='white'
                        strokeWidth='0.921989'
                      />
                    </g>
                    <defs>
                      <filter
                        colorInterpolationFilters='sRGB'
                        filterUnits='userSpaceOnUse'
                        height='17.9219'
                        id='filter0_d_1_863_pace'
                        width='16.6292'
                        x='0'
                        y='0'
                      >
                        <feFlood floodOpacity='0' result='BackgroundImageFix' />
                        <feColorMatrix
                          in='SourceAlpha'
                          result='hardAlpha'
                          type='matrix'
                          values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0'
                        />
                        <feOffset dy='0.921989' />
                        <feGaussianBlur stdDeviation='0.921989' />
                        <feColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.28 0' />
                        <feBlend in2='BackgroundImageFix' mode='normal' result='effect1_dropShadow_1_863' />
                        <feBlend in='SourceGraphic' in2='effect1_dropShadow_1_863' mode='normal' result='shape' />
                      </filter>
                    </defs>
                  </svg>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Bubble - Floating Animation */}
        <motion.div
          className='pointer-events-auto absolute top-[19px] left-[14px] box-border flex flex-col items-start gap-[12px] rounded-[12px] bg-neutral-900 px-[12px] py-[8px] shadow-[10px_0px_50px_0px_rgba(0,0,0,0.05)]'
          animate={{ y: [0, -4, 0] }}
          transition={{
            duration: 4,
            delay: 0.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <motion.p
            key={message}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative shrink-0 font-['Inter',sans-serif] text-[12px] leading-[normal] font-[550] text-nowrap whitespace-pre text-white not-italic"
          >
            {message}
          </motion.p>
        </motion.div>
      </div>
    </motion.div>
  );
};
